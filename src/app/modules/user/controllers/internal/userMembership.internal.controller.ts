import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { Between, FindOptionsRelations } from 'typeorm';
import { UserMembershipCreateDTO } from '../../dtos/userMembership/create.dto';
import { UserMembershipFilterDTO } from '../../dtos/userMembership/filter.dto';
import { UserMembershipUpdateDTO } from '../../dtos/userMembership/update.dto';
import { UserMembership } from '../../entities/userMembership.entity';
import { UserMembershipService } from '../../services/userMembership.service';

@ApiTags('User Membership')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/user-memberships')
export class UserMembershipInternalController {
  constructor(private readonly service: UserMembershipService) { }

  RELATIONS: FindOptionsRelations<UserMembership> = {
    user: true,
  };

  @Get()
  async findAll(@Query() query: UserMembershipFilterDTO): Promise<SuccessResponse<UserMembership[]>> {
    if (query?.startDate && query?.endDate) {
      query['createdAt'] = Between(query?.startDate, query?.endDate);
    }
    delete query?.startDate;
    delete query?.endDate;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserMembership> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: UserMembershipCreateDTO): Promise<UserMembership> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UserMembershipUpdateDTO,
  ): Promise<UserMembership> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
