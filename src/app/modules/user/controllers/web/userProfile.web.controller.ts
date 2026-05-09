import { Body, Controller, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { FindOptionsRelations } from 'typeorm';
import { UserProfileCreateDTO } from '../../dtos/userProfile/create.dto';
import { UserProfileUpdateDTO } from '../../dtos/userProfile/update.dto';
import { UserProfile } from '../../entities/userProfile.entity';
import { UserProfileService } from '../../services/userProfile.service';

@ApiTags('User Profile')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/user-profiles')
export class UserProfileWebController {
  constructor(private readonly service: UserProfileService) { }
  RELATIONS: FindOptionsRelations<UserProfile> = {
    user: true,
  };

  @Get('my')
  async findMy(@AuthUser() authUser: IAuthUser): Promise<UserProfile> {
    return this.service.findOne(
      { userId: authUser.id },
      {
        relations: {
          user: true
        },
      },
    );
  }

  @Post()
  async createOne(
    @Body() body: UserProfileCreateDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<UserProfile> {
    body.userId = authUser.id;
    return this.service.createOne(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UserProfileUpdateDTO,
  ): Promise<UserProfile> {
    return this.service.updateOne(id, body, { relations: this.RELATIONS });
  }
}
