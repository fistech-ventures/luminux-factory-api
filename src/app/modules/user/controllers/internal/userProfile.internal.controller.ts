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
import { FindOptionsRelations } from 'typeorm';
import { UserProfileCreateDTO } from '../../dtos/userProfile/create.dto';
import { UserProfileFilterDTO } from '../../dtos/userProfile/filter.dto';
import { UserProfileUpdateDTO, UserProfileVerifyDTO } from '../../dtos/userProfile/update.dto';
import { UserProfile } from '../../entities/userProfile.entity';
import { UserProfileService } from '../../services/userProfile.service';

@ApiTags('User Profile')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/user-profiles')
export class UserProfileInternalController {
  constructor(private readonly service: UserProfileService) { }

  RELATIONS: FindOptionsRelations<UserProfile> = {
    user: true,
  };

  @Get()
  async findAll(@Query() query: UserProfileFilterDTO): Promise<SuccessResponse<UserProfile[]>> {
    return this.service.findAll(query, { relations: this.RELATIONS });
  }

  @Get('details/:id')
  async getDetails(@Param('id') id: string): Promise<UserProfile> {
    return this.service.findById(id, {
      relations: {
        user: true,
      },
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserProfile> {
    return this.service.findById(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: UserProfileCreateDTO): Promise<UserProfile> {
    return this.service.createOne(body, { relations: this.RELATIONS });
  }

  @Patch('verify/:id')
  async verify(
    @Param('id') id: string,
    @Body() body: UserProfileVerifyDTO,
  ): Promise<UserProfile> {
    return this.service.verify(id, body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UserProfileUpdateDTO,
  ): Promise<UserProfile> {
    return this.service.updateOne(id, body, { relations: this.RELATIONS });
  }
}
