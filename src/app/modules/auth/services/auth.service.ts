import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BcryptHelper } from '@src/app/helpers';
import { IAuthUser, ILginResponse } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { generateStrongPassword, ENUM_ACL_DEFAULT_ROLES, ENUM_AUTH_PROVIDERS, identifyIdentifier } from '@src/shared';
import { DataSource } from 'typeorm';
import { Role } from '../../acl/entities/role.entity';
import { RoleService } from '../../acl/services/role.service';
import { UserProfileCreateDTO } from '../../user/dtos/userProfile/create.dto';
import { User } from '../../user/entities/user.entity';
import { UserProfileService } from '../../user/services/userProfile.service';
import { UserRoleService } from '../../user/services/userRole.service';
import { LoginDTO } from '../dtos/login.dto';
import { RefreshTokenDTO } from '../dtos/refreshToken.dto';
import { RegisterDTO } from '../dtos/register.dto';
import { ValidateDTO } from '../dtos/validate.dto';
import { JWTHelper } from './../../../helpers/jwt.helper';
import { UserService } from './../../user/services/user.service';
import { ChangePasswordDTO } from './../dtos/changePassword.dto';
import { QuickRegistrationDTO } from './../dtos/quickRegistration.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly jwtHelper: JWTHelper,
    private readonly bcryptHelper: BcryptHelper,
    private readonly userProfileService: UserProfileService,
  ) { }

  async loginResponse(
    user: User,
    options: { message?: string; remember?: boolean; rememberDays?: number } = {},
  ): Promise<SuccessResponse<ILginResponse>> {
    const { message, remember = false, rememberDays = 7 } = options;

    const { roles, permissions } = await this.getUserRolePermissions(user?.id);

    const tokenPayload = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        roles,
      },
    };

    const refreshTokenPayload = {
      isRefreshToken: true,
      user: {
        id: user.id,
      },
    };

    const permissionTokenPayload = {
      permissions,
    };

    const tokenExpireIn = remember ? rememberDays + 'd' : ENV.jwt.tokenExpireIn;
    const refreshTokenExpireIn = remember ? rememberDays + 'd' : ENV.jwt.refreshTokenExpireIn;

    const accessToken = this.jwtHelper.makeAccessToken(tokenPayload, tokenExpireIn);
    const refreshToken = this.jwtHelper.makeRefreshToken(refreshTokenPayload, refreshTokenExpireIn);
    const permissionToken = this.jwtHelper.makePermissionToken(
      permissionTokenPayload,
      refreshTokenExpireIn,
    );

    return new SuccessResponse(message ?? 'Login success', {
      accessToken,
      refreshToken,
      permissionToken,
      user: ENV.isProduction ? null : { ...tokenPayload.user },
    });
  }

  async validateUserUsingIdentifierAndPassword(
    identifier: string,
    password: string,
  ): Promise<User> {
    const whereConditions: any = {};
    const query = await identifyIdentifier(identifier);
    whereConditions[query.key] = query.value;

    const user = await this.userService.findOne({
      where: {
        ...whereConditions,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.bcryptHelper.compareHash(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async changePassword(
    payload: ChangePasswordDTO,
    authUser: IAuthUser,
  ): Promise<SuccessResponse<ILginResponse>> {
    const { oldPassword, newPassword } = payload;

    const user = await this.userService.findOne({
      where: { id: authUser.id as any },
      select: ['id', 'fullName', 'email', 'password', 'phoneNumber', 'authProvider'],
    });

    if (!user) {
      throw new BadRequestException('User does not exists');
    }

    const isPasswordMatched = await this.bcryptHelper.compareHash(oldPassword, user.password);

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid old password');
    }

    const updatedUser = await this.userService.saveOne({
      id: user.id,
      password: newPassword,
    });
    return this.loginResponse(updatedUser, {
      message: 'Password changed successfully.',
    });
  }

  async registerUser(payload: RegisterDTO & { role?: string }): Promise<SuccessResponse> {
    let targetRole: Role = null;
    if (payload?.role) {
      targetRole = await this.roleService.findOne({
        where: {
          title: payload.role,
        },
      });
      if (!targetRole) throw new NotFoundException('Role Not Found');
    }

    const whereConditions = [];
    const identify = identifyIdentifier(payload?.identifier);
    whereConditions.push({ [identify.key]: identify.value });

    const isExist = await this.userService.findOne({
      where: whereConditions.length ? whereConditions : undefined, // Avoid invalid queries
    });

    if (isExist && identify.key === 'email') {
      throw new ConflictException('Email number already exists');
    } else if (isExist && identify.key === 'phoneNumber') {
      throw new ConflictException('Phone number already exists');
    } else if (isExist && identify.key === 'username') {
      // Because username is not supported while registering
      throw new ConflictException('Invalid identifier');
    }

    const payloadForNewUser = {
      fullName: payload.fullName,
      email: identify.key === 'email' ? payload.identifier : null,
      phoneNumber: identify.key === 'phoneNumber' ? payload.identifier : null,
      password: payload.password,
    };

    const createdUser = await this.userService.createOneBase(payloadForNewUser);
    if (targetRole && createdUser) {
      const createdUserRole = await this.userRoleService.createOneBase({
        userId: createdUser.id,
        roleId: targetRole.id,
      });
      if (targetRole.title === ENUM_ACL_DEFAULT_ROLES.CUSTOMER) {
        const payloadForWorkerProfile = {
          userId: createdUser.id,
          fullName: createdUser.fullName,
          email: createdUser.email ?? null,
          phoneNumber: createdUser.phoneNumber ?? null,
        } as UserProfileCreateDTO;
        const profile = await this.userProfileService.createOne(payloadForWorkerProfile);
        if (!profile) {
          // Soft-delete the user and user_role instead of hard-deleting them.
          // These are data tables, so they are never hard-deleted.
          await this.userService.softDeleteOneBase(createdUser.id);
          await this.userRoleService.softDeleteOneBase(createdUserRole.id);
          throw new BadRequestException('Cannot create worker profile');
        }
      }
    }

    return new SuccessResponse('User Registered Successfully', {
      identifier: payload?.identifier,
      message: 'User registered successfully. You can login now.',
    });
  }

  async loginUser(payload: LoginDTO): Promise<SuccessResponse> {
    const identify = identifyIdentifier(payload.identifier);
    const user = await this.userService.findOne({
      where: {
        [identify.key]: identify.value,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        password: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    const isPasswordMatch = await this.bcryptHelper.compareHash(payload.password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('Password does not match');
    }

    return this.loginResponse(user, {
      remember: payload.remember,
      rememberDays: payload.rememberDays,
    });
  }

  async refreshToken(payload: RefreshTokenDTO): Promise<SuccessResponse<ILginResponse>> {
    const decoded = this.jwtHelper.verifyRefreshToken(payload.refreshToken);
    if (!decoded.user || !decoded.user.id) {
      throw new BadRequestException('Invalid token');
    }
    const user = await this.userService.findOne({
      where: {
        id: decoded.user.id,
      },
    });

    return this.loginResponse(user, { message: 'Refresh token success' });
  }

  async getUserRolePermissions(userId: string): Promise<any> {
    const { data: userRoles } = await this.userRoleService.findAllBase(
      { userId: userId },
      {
        relations: { role: true },
      },
    );

    const roles = userRoles.map((uR) => uR.role.title);
    const permissions = await this.userRoleService.getUserPermissions(userId);
    return {
      roles,
      permissions,
    };
  }

  async validate(payload: ValidateDTO): Promise<SuccessResponse> {
    return this.validateUsingSystemAuth(payload);
  }

  async validateUsingSystemAuth(payload: ValidateDTO): Promise<SuccessResponse> {
    const decodedToken = this.jwtHelper.verify(payload.token) as {
      userId: string;
    };

    if (!decodedToken) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({
      where: { id: decodedToken.userId as any },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return this.loginResponse(user, { message: 'Validated success' });
  }

  async quickRegisterUser(
    quickRegistrationData: QuickRegistrationDTO,
    authUser?: any,
  ): Promise<{ user: User; password: string; isNewUser: boolean }> {
    const { fullName, phoneNumber, email } = quickRegistrationData;

    // Check if user already exists by phone or email
    const existingUser = await this.userService.findOne({
      where: [
        { phoneNumber },
        ...(email ? [{ email }] : []),
      ],
    });

    if (existingUser) {
      // Update user info if needed
      if (existingUser.fullName === 'Walking Customer' && fullName !== 'Walking Customer') {
        await this.userService.updateOneBase(existingUser.id, {
          fullName,
          ...(email && !existingUser.email ? { email } : {}),
        });
      }

      return {
        user: existingUser,
        password: null, // Don't expose password for existing users
        isNewUser: false,
      };
    }

    // Generate password for new user
    const password = generateStrongPassword(12);
    const bcryptHelper = new BcryptHelper();
    const hashedPassword = await bcryptHelper.hash(password);

    // Get customer role
    const customerRole = await this.roleService.findOneBase({
      title: ENUM_ACL_DEFAULT_ROLES.CUSTOMER,
    });

    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create new user
      const newUser = await this.userService.createOneBase({
        fullName,
        phoneNumber,
        email: email || null,
        password: hashedPassword,
        authProvider: ENUM_AUTH_PROVIDERS.SYSTEM,
        isVerified: true,
        createdBy: authUser,
      });

      // Assign customer role
      await this.userRoleService.createOneBase({
        userId: newUser.id,
        roleId: customerRole.id,
      });

      await queryRunner.commitTransaction();

      return {
        user: newUser,
        password,
        isNewUser: true,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
