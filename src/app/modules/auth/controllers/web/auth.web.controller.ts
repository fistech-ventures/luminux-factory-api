import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { IAuthUser, ILginResponse } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { ChangePasswordDTO } from '../../dtos/changePassword.dto';
import { LoginDTO } from '../../dtos/login.dto';
import { RefreshTokenDTO } from '../../dtos/refreshToken.dto';
import { RegisterDTO } from '../../dtos/register.dto';
import { ValidateDTO } from '../../dtos/validate.dto';
import { AuthService } from '../../services/auth.service';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('web/auth')
export class AuthWebController {
  constructor(private readonly service: AuthService) { }


  @Public()
  @Post('validate')
  async validate(@Body() body: ValidateDTO): Promise<SuccessResponse<ILginResponse>> {
    return this.service.validate({ ...body, role: ENUM_ACL_DEFAULT_ROLES.CUSTOMER });
  }

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

  @Public()
  @Post('register')
  async registerUser(@Body() body: RegisterDTO): Promise<SuccessResponse> {
    return this.service.registerUser({
      ...body,
      role: ENUM_ACL_DEFAULT_ROLES.CUSTOMER,
    });
  }

  @Public()
  @Post('register-supplier')
  async registerSupplier(@Body() body: RegisterDTO): Promise<SuccessResponse> {
    return this.service.registerUser({
      ...body,
      role: ENUM_ACL_DEFAULT_ROLES.SUPPLIER,
    });
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDTO): Promise<SuccessResponse<ILginResponse>> {
    return this.service.refreshToken(body);
  }

  @Patch('change-password')
  async changePassword(
    @Body() body: ChangePasswordDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse<ILginResponse>> {
    return this.service.changePassword(body, authUser);
  }
}
