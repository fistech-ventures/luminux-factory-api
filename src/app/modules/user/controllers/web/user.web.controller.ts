import { Body, Controller, ForbiddenException, Get, Patch, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { FindOptionsRelations } from 'typeorm';
import { UpdateUserDTO } from '../../dtos';
import { User } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/users')
export class UserWebController {
  constructor(private readonly service: UserService) { }

  RELATIONS: FindOptionsRelations<User> = {
    userRoles: {
      role: true,
    },
  };

  @Get('me')
  async findMy(@AuthUser() authUser: IAuthUser): Promise<User> {
    return this.service.findByIdBase(authUser.id, { relations: this.RELATIONS });
  }

  @Patch('me')
  async updateOne(@AuthUser() authUser: IAuthUser, @Body() body: UpdateUserDTO): Promise<User> {
    if (body?.roles?.length) throw new ForbiddenException('You are not allowed to modify role!')
    delete body?.roles;
    return this.service.updateUser(authUser.id, body, this.RELATIONS);
  }
}
