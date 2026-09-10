import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);
import { BcryptHelper, EmailHelper } from '@src/app/helpers';
import { IAuthUser, ILginResponse } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { generateStrongPassword, ENUM_ACL_DEFAULT_ROLES, ENUM_AUTH_PROVIDERS, ENUM_VERIFICATION_TYPES, gen6digitOTP, identifyIdentifier } from '@src/shared';
import { DataSource } from 'typeorm';
import { Role } from '../../acl/entities/role.entity';
import { RoleService } from '../../acl/services/role.service';
import { GlobalConfigService } from '../../globalConfig/services/globalConfig.service';
import { EmailService } from '../../notification/services/email.service';
import { SmsService } from '../../notification/services/sms.service';
import { UserProfileCreateDTO } from '../../user/dtos/userProfile/create.dto';
import { User } from '../../user/entities/user.entity';
import { UserProfileService } from '../../user/services/userProfile.service';
import { UserRoleService } from '../../user/services/userRole.service';
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
    private readonly jwtHelper: JWTHelper,
    private readonly bcryptHelper: BcryptHelper,
    private readonly emailHelper: EmailHelper,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly globalConfigService: GlobalConfigService,
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

    const globalConfig = await this.globalConfigService.getConfig();
    const verificationRequired = globalConfig.userRegistrationVerificationRequired ?? false;

    if (verificationRequired) {
      const response = await this.otpSentForVerification({
        verificationType: ENUM_VERIFICATION_TYPES.SIGN_UP,
        identifier: payload?.identifier,
      });
      return new SuccessResponse('User Registered Successfully', response);
    }

    // Mark verified since verification is not required
    await this.userService.updateOneBase(createdUser.id, { isVerified: true });

    return new SuccessResponse('User Registered Successfully', {
      identifier: payload?.identifier,
      message: 'User registered successfully. You can login now.',
    });
  }

  async loginUser(payload: LoginDTO): Promise<SuccessResponse> {
    const globalConfig = await this.globalConfigService.getConfig();
    const verificationRequired = globalConfig.userRegistrationVerificationRequired ?? false;

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

    if (!user.isVerified && verificationRequired) {
      const response = await this.otpSentForVerification({
        verificationType: ENUM_VERIFICATION_TYPES.SIGN_UP,
        identifier: payload.identifier,
      });

      return new SuccessResponse('User is not verified...! Please Verify First For Login', {
        ...response,
        isVerified: false,
      });
    }

    if (!user.isVerified && !verificationRequired) {
      // Fallback: verified login is disabled, but user is still unverified.
      // Try password login; if it matches, send an OTP (email + phone) and allow
      // the user to complete login via OTP instead of the password path.
      const otpResponse = await this.otpSentForVerification({
        verificationType: ENUM_VERIFICATION_TYPES.SIGN_UP,
        identifier: payload.identifier,
        sendToBoth: true,
      });

      return new SuccessResponse('User is not verified. OTP sent to complete login.', {
        ...otpResponse,
        isVerified: false,
        loginFallback: true,
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


  async otpSentForVerification(payload: {
    verificationType: keyof typeof ENUM_VERIFICATION_TYPES;
    identifier?: string;
    sendToBoth?: boolean;
  }): Promise<{ message: string; identifier: string; hash: string; otp: number }> {
    const { verificationType, identifier, sendToBoth } = payload;

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

    const shouldUseEmail = sentTo.isEmail || (sendToBoth && user.email);
    const shouldUsePhone = sentTo.isPhoneNumber || (sendToBoth && user.phoneNumber);

    const config = await this.globalConfigService.getConfig();
    const expiresIn = config.otpExpiresInMin;

    const otp = gen6digitOTP();
    const hash = this.jwtHelper.generateOtpHash(identifier, otp, expiresIn);

    const messages = [
      ...(shouldUseEmail
        ? [
            await this.sendEmailOtp(
              identify.key === 'email' ? identifier : user.email!,
              user,
              otp,
              expiresIn,
              verificationType,
              verificationType === ENUM_VERIFICATION_TYPES.RESET_PASSWORD
                ? 'reset-password'
                : 'registration-otp',
            ),
          ]
        : []),
      ...(shouldUsePhone
        ? [
            await this.sendSmsOtp(
              identify.key === 'phoneNumber' ? identifier : user.phoneNumber!,
              otp,
              expiresIn,
              verificationType,
            ),
          ]
        : []),
    ];

    const message = messages.length ? messages.join(' ') : 'No delivery channel available for OTP.';

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

    // Check global config for verification requirement
    const globalConfig = await this.globalConfigService.getConfig();
    const verificationRequired = globalConfig.userRegistrationVerificationRequired ?? false;

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
        isVerified: !verificationRequired,
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

  async sendWelcomeEmail(
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

  private async renderOtpTemplate(
    templateType: string,
    data: Record<string, any>,
  ): Promise<string> {
    try {
      const templatePath = path.join(
        process.cwd(),
        `views/email-templates/${templateType}.template.hbs`,
      );
      const content = await readFile(templatePath, 'utf8');
      const template = Handlebars.compile(content);
      return template(data);
    } catch (error) {
      console.error('🚀 ~ AuthService ~ renderOtpTemplate ~ error:', error);
      return '';
    }
  }

  private async sendSmsOtp(
    recipient: string,
    otp: number,
    expiresIn: number,
    verificationType: keyof typeof ENUM_VERIFICATION_TYPES,
  ): Promise<string> {
    const smsText = `Your OTP for ${verificationType} is ${otp}. It will expire in ${expiresIn} minutes.`;

    try {
      await this.smsService.sendSmsThroughDefaultGateway({
        recipient,
        message: smsText,
      });
      return `Your OTP for ${verificationType} is sent to your phone. It will expire in ${expiresIn} minutes.`;
    } catch (error) {
      console.error('🚀 ~ AuthService ~ sendSmsOtp ~ error:', error);
      return `Error sending OTP to your phone. Please try again later.`;
    }
  }

  private async sendEmailOtp(
    to: string,
    user: User,
    otp: number,
    expiresIn: number,
    verificationType: keyof typeof ENUM_VERIFICATION_TYPES,
    templateType: string,
  ): Promise<string> {
    const emailContent = await this.emailHelper.createEmailContent(
      { otp, clientName: user.fullName, expiresIn, copyRightYear: new Date().getFullYear() },
      templateType,
    );

    try {
      await this.emailService.sendEmailThroughDefaultGateway({
        to,
        subject: `Verification OTP - ${user.fullName}`,
        html: emailContent,
      });
      return `Your OTP for ${verificationType} is sent to your email. It will expire in ${expiresIn} minutes.`;
    } catch (error) {
      console.error('🚀 ~ AuthService ~ sendEmailOtp ~ error:', error);
      return `Error sending OTP to your email. Please try again later.`;
    }
  }
}
