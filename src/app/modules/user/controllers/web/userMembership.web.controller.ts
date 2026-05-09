import {
  Body,
  Controller,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { FindOptionsRelations } from 'typeorm';
import { UserMembershipCreateDTO } from '../../dtos/userMembership/create.dto';
import { UserMembership } from '../../entities/userMembership.entity';
import { UserMembershipService } from '../../services/userMembership.service';

@ApiTags('User Membership')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/user-memberships')
export class UserMembershipWebController {
  constructor(private readonly service: UserMembershipService) { }
  RELATIONS: FindOptionsRelations<UserMembership> = {
    user: true,
  };

  @Public()
  @Post()
  async createOne(@Body() body: UserMembershipCreateDTO): Promise<UserMembership> {
    return this.service.createOne(body);
  }
}
