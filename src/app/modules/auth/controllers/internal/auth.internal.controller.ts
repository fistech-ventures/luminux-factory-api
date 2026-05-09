import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { IAuthUser, ILginResponse } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ChangePasswordDTO } from '../../dtos/changePassword.dto';
import { LoginDTO } from '../../dtos/login.dto';
import { RefreshTokenDTO } from '../../dtos/refreshToken.dto';
import { ResetPasswordDTO } from '../../dtos/resetPassword.dto';
import { SendOtpDTO } from '../../dtos/sendOtp.dto';
import { VerifyOtpDTO } from '../../dtos/verifyOtp.dto';
import { VerifyResetPasswordDTO } from '../../dtos/verifyResetPassword.dto';
import { AuthService } from '../../services/auth.service';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('internal/auth')
export class AuthInternalController {
  constructor(private readonly service: AuthService) {}

  // @Post('2fa/turn-on')
  // // @UseGuards(AuthGuard(JWT_STRATEGY))
  // @UseInterceptors(ResponseInterceptor)
  // async turnOn2fa(@AuthUser() authUser: IAuthUser): Promise<SuccessResponse> {
  //   return this.service.turnOn2fa(authUser);
  // }

  // @Post('2fa/turn-off')
  // // @UseGuards(AuthGuard(JWT_STRATEGY))
  // @UseInterceptors(ResponseInterceptor)
  // async turnOff2fa(@AuthUser() authUser: IAuthUser): Promise<SuccessResponse> {
  //   return this.service.turnOff2fa(authUser);
  // }

  // @Post('2fa/authenticate')
  // // @UseGuards(AuthGuard(JWT_STRATEGY))
  // @UseInterceptors(ResponseInterceptor)
  // async authenticate2fa(@Body() body: Authenticate2faDTO): Promise<SuccessResponse<ILginResponse>> {
  //   return this.service.authenticate2fa(body);
  // }

  @Public()
  @Post('login')
  async loginUser(@Body() body: LoginDTO): Promise<SuccessResponse> {
    return this.service.loginUser(body);
  }

  // @Post('register')
  // async registerUser(@Body() body: RegisterDTO) {
  //   return this.service.registerUser(body);
  // }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDTO): Promise<SuccessResponse<ILginResponse>> {
    return this.service.refreshToken(body);
  }

  @Public()
  @Post('otp-send')
  async sendB2bUserOtp(@Body() body: SendOtpDTO): Promise<SuccessResponse> {
    return this.service.sendOtp(body);
  }

  @Public()
  @Post('otp-verify')
  async verifyOtp(@Body() body: VerifyOtpDTO): Promise<SuccessResponse<ILginResponse>> {
    return this.service.verifyOtp(body);
  }

  @Public()
  @Post('reset-password-request')
  async resetPassword(@Body() body: ResetPasswordDTO): Promise<SuccessResponse> {
    return this.service.resetPassword(body);
  }

  @Public()
  @Post('reset-password-verify')
  async verifyPassword(
    @Body() body: VerifyResetPasswordDTO,
  ): Promise<SuccessResponse<ILginResponse>> {
    return this.service.verifyResetPassword(body);
  }

  @Patch('change-password')
  async changePassword(
    @Body() body: ChangePasswordDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse<ILginResponse>> {
    return this.service.changePassword(body, authUser);
  }
}
