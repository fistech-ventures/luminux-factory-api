import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { FilterRoleDTO } from '@src/app/modules/acl/dtos';
import { Role } from '@src/app/modules/acl/entities/role.entity';
import { SuccessResponse } from '@src/app/types';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { FindOptionsRelations, In } from 'typeorm';
import { FilterUserDTO, UpdateUserDTO, UserCreateDTO, UserInstantCreateDTO, UserRoleAssignOrRemoveDTO } from '../../dtos';
import { User } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';
import { AuthUser } from '@src/app/decorators';
import { IAuthUser } from '@src/app/interfaces';

@ApiTags('User')
@ApiBearerAuth()
@Controller('internal/users')
@UseInterceptors(InternalRequestInterceptor)
export class UserInternalController {
  constructor(
    private readonly service: UserService,
  ) { }

  RELATIONS: FindOptionsRelations<User> = {
    userRoles: {
      role: true,
    },
  };

  @Get()
  async findAll(@Query() query: FilterUserDTO): Promise<SuccessResponse<User[]>> {
    const filter: any = { ...query }
    if (query?.roles) {
      const roles = JSON.parse(query.roles);
      filter.userRoles = {
        role: { title: In(roles) }
      }
      delete filter?.roles
    }
    return this.service.findAllBase(filter, { relations: this.RELATIONS });
  }

  @Get(':id/available-roles')
  async availableRoles(@Param('id') id: string, @Query() query: FilterRoleDTO): Promise<Role[]> {
    return this.service.availableRoles(id, query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post('stuff')
  async createOneStuff(@Body() body: UserCreateDTO, @AuthUser() authUser: IAuthUser): Promise<User> {
    return this.service.createUser({
      ...body,
      roles: [
        ENUM_ACL_DEFAULT_ROLES.INTERNAL,
        ENUM_ACL_DEFAULT_ROLES.CUSTOMER
      ]
    }, authUser, this.RELATIONS);
  }

  @Post('customer')
  async createOneCustomer(@Body() body: UserCreateDTO, @AuthUser() authUser: IAuthUser): Promise<User> {
    return this.service.createUser({ ...body, roles: [ENUM_ACL_DEFAULT_ROLES.CUSTOMER] }, authUser, this.RELATIONS);
  }

  @Post('instant-customer')
  async findOrCreateByPhoneNumber(@Body() body: UserInstantCreateDTO, @AuthUser() authUser: IAuthUser): Promise<User> {
    return this.service.findOrCreateByPhoneNumber(body.phoneNumber, body?.fullName ?? 'Walking Customer', authUser);
  }

  @Patch(':id/roles')
  async assignOrRemoveRole(@Param('id') id: string, @Body() body: UserRoleAssignOrRemoveDTO): Promise<User> {
    return this.service.assignOrRemoveRole(id, body, this.RELATIONS);
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() body: UpdateUserDTO): Promise<User> {
    return this.service.updateUser(id, body, this.RELATIONS);
  }
}
