import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BcryptHelper, EmailHelper } from '@src/app/helpers';
import { IAuthUser, ILginResponse } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { generateStrongPassword, ENUM_ACL_DEFAULT_ROLES, ENUM_AUTH_PROVIDERS, ENUM_VERIFICATION_TYPES, gen6digitOTP, identifyIdentifier } from '@src/shared';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import * as Crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';
import { Role } from '../../acl/entities/role.entity';
import { RoleService } from '../../acl/services/role.service';
import { R2FileUploadService } from '../../gallery/services/r2FileUpload.service';
import { GlobalConfigService } from '../../globalConfig/services/globalConfig.service';
import { EmailService } from '../../notification/services/email.service';
import { SmsService } from '../../notification/services/sms.service';
import { UserProfileCreateDTO } from '../../user/dtos/userProfile/create.dto';
import { User } from '../../user/entities/user.entity';
import { UserProfileService } from '../../user/services/userProfile.service';
import { UserRoleService } from '../../user/services/userRole.service';
import { FacebookAuthRequestDTO } from '../dtos/facebookAuthRequest.dto';
import { GoogleAuthRequestDTO } from '../dtos/googleAuthRequest.dto';
import { LoginDTO } from '../dtos/login.dto';
import { RefreshTokenDTO } from '../dtos/refreshToken.dto';
import { RegisterDTO } from '../dtos/register.dto';
import { ResetPasswordDTO } from '../dtos/resetPassword.dto';
import { SendOtpDTO } from '../dtos/sendOtp.dto';
import { ValidateDTO } from '../dtos/validate.dto';
import { VerifyOtpDTO } from '../dtos/verifyOtp.dto';
import { VerifyResetPasswordDTO } from '../dtos/verifyResetPassword.dto';
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
    private readonly http: HttpService,
    private readonly jwtHelper: JWTHelper,
    private readonly bcryptHelper: BcryptHelper,
    private readonly emailHelper: EmailHelper,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly globalConfigService: GlobalConfigService,
    private readonly fileUploadService: R2FileUploadService,
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

  async sendOtp(payload: SendOtpDTO): Promise<SuccessResponse> {
    const response = await this.otpSentForVerification({
      verificationType: payload?.verificationType,
      identifier: payload?.identifier,
    });

    return new SuccessResponse(`OTP sent to ${response.identifier}.`, response);
  }

  async verifyOtp(payload: VerifyOtpDTO): Promise<SuccessResponse<ILginResponse>> {
    const { identifier, otp, hash } = payload;

    const whereConditions = {};
    const identify = identifyIdentifier(identifier);
    whereConditions[identify.key] = identify.value;

    const user = await this.userService.findOne({
      where: {
        ...whereConditions,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Account not found with this identifier');
    }

    const isOtpVerified = this.jwtHelper.verifyOtpHash(identifier, otp, hash);

    if (!isOtpVerified) {
      throw new BadRequestException('Invalid OTP');
    }

    const verifiedUser = await this.userService.saveOne({
      id: user.id,
      isVerified: true,
    });

    return this.loginResponse(verifiedUser, {
      message: 'OTP verified successfully',
    });
  }

  async resetPassword(payload: ResetPasswordDTO): Promise<SuccessResponse> {
    const response = await this.otpSentForVerification({
      verificationType: ENUM_VERIFICATION_TYPES.RESET_PASSWORD,
      identifier: payload?.identifier,
    });
    return new SuccessResponse(`OTP sent to ${response.identifier}.`, response);
  }

  async verifyResetPassword(
    payload: VerifyResetPasswordDTO,
  ): Promise<SuccessResponse<ILginResponse>> {
    const { identifier, otp, newPassword, hash } = payload;

    const whereConditions = {};
    const identify = identifyIdentifier(identifier);
    whereConditions[identify.key] = identify.value;

    const user = await this.userService.isExist({
      ...whereConditions,
    });

    if (!user) {
      throw new UnauthorizedException('Account not found with this identifier');
    }

    const isOtpVerified = this.jwtHelper.verifyOtpHash(identifier, otp, hash);

    if (!isOtpVerified) {
      throw new BadRequestException('Invalid OTP');
    }

    const updatedUser = await this.userService.saveOne({
      id: user.id,
      password: newPassword,
      isVerified: true,
    });

    return this.loginResponse(updatedUser, {
      message: 'Password reset successfully.',
    });
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

    // For social users who haven't set a password yet, skip old password verification
    const isSocialUser = user.authProvider === ENUM_AUTH_PROVIDERS.GOOGLE || user.authProvider === ENUM_AUTH_PROVIDERS.FACEBOOK;
    if (isSocialUser) {
      // Allow password change without old password verification for social users
      const updatedUser = await this.userService.saveOne({
        id: user.id,
        password: newPassword,
      });
      return this.loginResponse(updatedUser, {
        message: 'Password set successfully. You can now login with email/password.',
      });
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
          await this.userService.deleteOneBase(createdUser.id);
          await this.userRoleService.deleteOneBase(createdUserRole.id);
          throw new BadRequestException('Cannot create worker profile');
        }
      }
    }

    const response = await this.otpSentForVerification({
      verificationType: ENUM_VERIFICATION_TYPES.SIGN_UP,
      identifier: payload?.identifier,
    });

    return new SuccessResponse('User Registered Successfully', response);
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

    if (!user.isVerified) {
      const response = await this.otpSentForVerification({
        verificationType: ENUM_VERIFICATION_TYPES.SIGN_UP,
        identifier: payload.identifier,
      });

      return new SuccessResponse('User is not verified...! Please Verify First For Login', {
        ...response,
        isVerified: false,
      });
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

  async googleAuthRequest(query: GoogleAuthRequestDTO & { role?: string }): Promise<string> {
    const state = JSON.stringify({ provider: 'google', ...query });
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];
    const authorizationUrl =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${ENV.google.clientId}` +
      `&redirect_uri=${ENV.google.redirectUrl}` +
      '&response_type=code' +
      '&scope=' +
      scopes.join(' ') +
      '&state=' +
      state;
    return authorizationUrl;
  }

  async googleLogin(
    userData: Record<string, any>,
    state: string,
  ): Promise<{
    callBackUrl: string;
  }> {
    if (!userData) {
      throw new BadRequestException('No user from google');
    }
    const additionalData = JSON.parse(state) as {
      webRedirectUrl: string;
      provider: string;
      role?: string;
    };
    const isExist = await this.userService.findOne({
      where: { email: userData.email },
    });

    if (!isExist) {
      const queryRunner = await startTransaction(this.dataSource);
      try {
        const newUserData: User = {
          fullName: userData.fullName,
          email: userData.email,
          authProvider: ENUM_AUTH_PROVIDERS.GOOGLE,
          password: Crypto.randomBytes(20).toString('hex'),
          isVerified: true,
          avatar: userData.picture,
        };
        const createdUser = await queryRunner.manager.save(Object.assign(new User(), newUserData));

        if (!createdUser) {
          throw new BadRequestException('Cannot create user');
        }
        await commitTransaction(queryRunner);
      } catch (error) {
        console.error('🚀 ~ AuthService ~ error:', error);
        await rollbackTransaction(queryRunner);
      }
    }

    const newCreatedUser = await this.userService.findOne({
      where: { email: userData.email },
    });

    if (!newCreatedUser) {
      throw new BadRequestException('User not created');
    }

    //? Role assignment
    if (additionalData?.role) {
      const role = await this.roleService.findOne({
        where: {
          title: additionalData.role,
        },
      });
      if (role) {
        const isUserRoleExist = await this.userRoleService.findOne({
          where: {
            userId: newCreatedUser.id,
            roleId: role.id,
          },
        });
        if (!isUserRoleExist) {
          await this.userRoleService.createOneBase({
            userId: newCreatedUser.id,
            roleId: role.id,
          });
        }
      }
    }

    // Generate backend JWT token instead of using Google access token
    const loginResponse = await this.loginResponse(newCreatedUser);
    const callBackUrl = `${additionalData.webRedirectUrl}?token=${loginResponse.data.accessToken}&provider=${additionalData.provider}`;

    return {
      callBackUrl,
    };
  }

  async facebookAuthRequest(query: FacebookAuthRequestDTO & { role?: string }): Promise<string> {
    const state = JSON.stringify({ provider: 'facebook', ...query });
    const scopes = ['email'];
    const authorizationUrl = `https://www.facebook.com/${ENV.facebook.apiVersion}/dialog/oauth?client_id=${ENV.facebook.clientId
      }&redirect_uri=${ENV.facebook.redirectUrl}&scope=${scopes.join(',')}&state=${state}${ENV.facebook.configId ? `&config_id=${ENV.facebook.configId}` : ''}`;
    // console.log('🚀 ~ AuthService ~ facebookAuthRequest ~ authorizationUrl:', authorizationUrl);
    return authorizationUrl;
  }

  async facebookLogin(
    userData: Record<string, any>,
    state: string,
  ): Promise<{
    callBackUrl: string;
  }> {
    if (!userData) {
      throw new BadRequestException('No user from facebook');
    }
    const additionalData = JSON.parse(state) as {
      webRedirectUrl: string;
      provider: string;
      role?: string;
    };
    if (!userData?.email) {
      throw new BadRequestException(
        'Email is required, but your facebook account does not have it',
      );
      // userData.email = `${userData.providerIdentifier}@fibonaccibooks.com`;
    }

    const isExist = await this.userService.findOne({
      where: { email: userData.email },
    });

    if (!isExist) {
      const queryRunner = await startTransaction(this.dataSource);
      try {
        const newUserData: User = {
          fullName: userData.firstName,
          email: userData.email,
          authProvider: ENUM_AUTH_PROVIDERS.FACEBOOK,
          password: Crypto.randomBytes(20).toString('hex'),
          isVerified: true,
          avatar: userData.picture,
        };
        const createdUser = await queryRunner.manager.save(Object.assign(new User(), newUserData));

        if (!createdUser) {
          throw new BadRequestException('Cannot create user');
        }

        await commitTransaction(queryRunner);
      } catch (error) {
        // console.log('🚀 ~ AuthService ~ error:', error);
        await rollbackTransaction(queryRunner);
        throw error;
      }
    }

    const newCreatedUser = await this.userService.findOne({
      where: { email: userData.email },
    });

    if (!newCreatedUser) {
      throw new BadRequestException('User not created');
    }

    //? Role assignment
    if (additionalData?.role) {
      const role = await this.roleService.findOne({
        where: {
          title: additionalData.role,
        },
      });
      if (role) {
        const isUserRoleExist = await this.userRoleService.findOne({
          where: {
            userId: newCreatedUser.id,
            roleId: role.id,
          },
        });
        if (!isUserRoleExist) {
          await this.userRoleService.createOneBase({
            userId: newCreatedUser.id,
            roleId: role.id,
          });
        }
      }
    }

    // Generate backend JWT token instead of using Facebook access token
    const loginResponse = await this.loginResponse(newCreatedUser);
    const callBackUrl = `${additionalData.webRedirectUrl}?token=${loginResponse.data.accessToken}&provider=${additionalData.provider}`;

    return {
      callBackUrl,
    };
  }

  async validate(payload: ValidateDTO): Promise<SuccessResponse> {
    if (payload.provider === ENUM_AUTH_PROVIDERS.GOOGLE)
      return this.validateUsingGoogleAuth(payload);
    if (payload.provider === ENUM_AUTH_PROVIDERS.FACEBOOK)
      return this.validateUsingFacebookAuth(payload);
    return this.validateUsingSystemAuth(payload);
  }

  async validateUsingFacebookAuth(payload: ValidateDTO): Promise<SuccessResponse> {
    const fields = 'id,name,link,picture.width(400).height(400),email';

    const facebookUrl = `https://graph.facebook.com/v22.0/me?fields=${fields}&access_token=${payload.token}`;

    const facebookResponse = await this.http.get(facebookUrl);
    const responseData = (await firstValueFrom(facebookResponse)).data;

    let user: User = null;
    if (!responseData?.email) {
      throw new BadRequestException(
        'Email is required, but your facebook account does not have it',
      );
    } else {
      user = await this.userService.findOne({
        where: { email: responseData.email },
      });
    }
    let isNewUser = false;

    if (!user) {
      const avatarUrl = responseData?.picture?.data?.url
        ? await this.fileUploadService.uploadFacebookProfilePic(responseData?.picture?.data?.url)
        : null;

      const payloadForNewUser = {
        fullName: responseData.name,
        email: responseData?.email,
        avatar: avatarUrl,
        authProvider: ENUM_AUTH_PROVIDERS.FACEBOOK,
        authProviderMetaInfo: {
          id: responseData.id,
          email: responseData?.email,
          name: responseData?.name,
          provider: ENUM_AUTH_PROVIDERS.FACEBOOK,
          authenticator: {
            id: '',
            title: '',
          },
        },
        isVerified: true,
      };

      const createdUser = await this.userService.createOneBase(payloadForNewUser);
      if (payload.role && createdUser) {
        const targetRole = await this.roleService.findOrCreateRole(payload.role);
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
            await this.userService.deleteOneBase(createdUser.id);
            await this.userRoleService.deleteOneBase(createdUserRole.id);
            throw new BadRequestException('Cannot create worker profile');
          }
          isNewUser = true;
        }
      }
    }
    const loginResponseData = await this.loginResponse(user);
    return new SuccessResponse('Validated successfully', {
      authSession: loginResponseData.data,
      isNewUser,
    });
  }

  async validateUsingGoogleAuth(payload: ValidateDTO): Promise<SuccessResponse> {
    const googleUrl = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${payload.token}`;

    const googleResponse = await this.http.get(googleUrl);
    const responseData = (await firstValueFrom(googleResponse)).data;

    let user: User = null;
    // let isEmailRequired = false;
    if (!responseData?.email) {
      // const userSocialAccount = await this.userSocialAccountService.findOneBase({
      //   identifier: responseData.id,
      // });
      // user = await this.userService.findOne({
      //   where: { id: userSocialAccount.userId },
      // });
      // if (!user?.email || user?.email == `${userSocialAccount.identifier}@fibonaccibooks.com`) {
      //   isEmailRequired = true;
      // }
    } else {
      user = await this.userService.findOne({
        where: { email: responseData.email },
      });
    }
    let isNewUser = false;
    if (!user) {
      const avatarUrl = null;

      const payloadForNewUser = {
        fullName: responseData.name,
        email: responseData?.email,
        avatar: avatarUrl,
        authProvider: ENUM_AUTH_PROVIDERS.GOOGLE,
        authProviderMetaInfo: {
          id: responseData.id,
          email: responseData?.email,
          name: responseData?.name,
          provider: ENUM_AUTH_PROVIDERS.GOOGLE,
          authenticator: {
            id: '',
            title: '',
          },
        },
        isVerified: true,
      };

      const createdUser = await this.userService.createOneBase(payloadForNewUser);
      if (payload.role && createdUser) {
        const targetRole = await this.roleService.findOrCreateRole(payload.role);
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
            await this.userService.deleteOneBase(createdUser.id);
            await this.userRoleService.deleteOneBase(createdUserRole.id);
            throw new BadRequestException('Cannot create worker profile');
          }
          isNewUser = true;
        }
      }
    }

    const loginResponseData = await this.loginResponse(user);
    return new SuccessResponse('Validated successfully', {
      authSession: loginResponseData.data,
      isNewUser,
    });
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


  async otpSentForVerification(payload: {
    verificationType: keyof typeof ENUM_VERIFICATION_TYPES;
    identifier?: string;
  }): Promise<{ message: string; identifier: string; hash: string; otp: number }> {
    const { verificationType, identifier } = payload;

    const whereConditions = {};
    const identify = identifyIdentifier(identifier);
    whereConditions[identify.key] = identify.value;

    const user = await this.userService.isExist({
      ...whereConditions,
    });

    if (!user) {
      throw new UnauthorizedException('Account not found with this identifier');
    }

    const sentTo = { identifier, isEmail: false, isPhoneNumber: false };
    if (identify?.key === 'email') {
      sentTo.isEmail = true;
    } else if (identify.key === 'phoneNumber') {
      sentTo.isPhoneNumber = true;
    } else {
      throw new BadRequestException(
        'Identifier should be email or phone number for verification !',
      );
    }

    const config = await this.globalConfigService.getConfig();
    const expiresIn = config.otpExpiresInMin;

    const otp = gen6digitOTP();
    const hash = this.jwtHelper.generateOtpHash(identifier, otp, expiresIn);

    let message: string;
    const messageType =
      verificationType === ENUM_VERIFICATION_TYPES.SIGN_UP ? 'Sign Up' : ENUM_VERIFICATION_TYPES.SIGN_IN ? 'Sign In' : 'Reset Password';
    if (sentTo.isEmail) {
      let template = '';
      if (verificationType === ENUM_VERIFICATION_TYPES.SIGN_UP) {
        template = 'account-verify';
      } else if (verificationType === ENUM_VERIFICATION_TYPES.SIGN_IN) {
        template = 'account-verify';
      } else if (verificationType === ENUM_VERIFICATION_TYPES.RESET_PASSWORD) {
        template = 'reset-password';
      }
      const emailContent = await this.emailHelper.createEmailContent(
        { otp, clientName: user.fullName, expiresIn, copyRightYear: new Date().getFullYear() },
        template,
      );
      try {
        this.emailService.sendEmailThroughDefaultGateway({
          to: identifier,
          subject: `Verification OTP - ${user.fullName}`,
          html: emailContent,
        });
        message = `Your OTP for ${messageType} is send to your email. It will expire in ${expiresIn} minutes.`;
      } catch (error) {
        message = `Error sending OTP to your email. Please try again later.`;
        console.error('🚀 ~ AuthService ~ otpSentForVerification ~ type:email ~ error:', error);
      }
    } else if (sentTo.isPhoneNumber) {
      const smsContent = `Your OTP for ${verificationType} is ${otp}. It will expire in ${expiresIn} minutes.`;
      try {
        this.smsService.sendSmsThroughDefaultGateway({
          recipient: identifier,
          message: smsContent,
        });
        message = `Your OTP for ${messageType} is send to your phone number. It will expire in ${expiresIn} minutes.`;
      } catch (error) {
        console.error('🚀 ~ AuthService ~ otpSentForVerification ~ type:phone ~ error:', error);
        message = `Error sending OTP to your phone number. Please try again later.`;
      }
    }

    const response = {
      message,
      identifier: identifier,
      hash,
      otp: ENV.isProduction ? null : otp,
    };

    return response;
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
        isVerified: false,
        createdBy: authUser,
      });

      // Assign customer role
      await this.userRoleService.createOneBase({
        userId: newUser.id,
        roleId: customerRole.id,
      });

      await queryRunner.commitTransaction();

      // Send welcome email with password if email provided
      if (email) {
        await this.sendWelcomeEmail(email, fullName, phoneNumber, password);
      }

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

  
  private async sendWelcomeEmail(
    email: string,
    fullName: string,
    phoneNumber: string,
    password: string,
  ): Promise<void> {
    const subject = 'Welcome to Fibonacci Books - Your Account Details';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 20px;">Welcome to Fibonacci Books!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your account has been successfully created. You can now login and enjoy our services.
          </p>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border: 1px solid #e9ecef; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Account Details</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #555;">Full Name:</strong>
            <span style="color: #333; margin-left: 10px;">${fullName}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #555;">Phone Number:</strong>
            <span style="color: #333; margin-left: 10px;">${phoneNumber}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #555;">Email:</strong>
            <span style="color: #333; margin-left: 10px;">${email}</span>
          </div>
          
          <div style="margin-bottom: 25px; padding: 15px; background-color: #e3f2fd; border-radius: 5px;">
            <strong style="color: #1976d2;">Your Password:</strong>
            <span style="color: #d32f2f; font-weight: bold; margin-left: 10px; font-size: 16px;">${password}</span>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.WEB_URL || 'http://localhost:3000'}/login" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Login to Your Account
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>For security reasons, we recommend changing your password after your first login.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `;

    try {
      await this.emailService.sendEmailThroughDefaultGateway({
        to: email,
        subject,
        html: htmlContent,
      });
      
      console.info(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error here as user creation should not fail due to email issues
    }
  }
}
