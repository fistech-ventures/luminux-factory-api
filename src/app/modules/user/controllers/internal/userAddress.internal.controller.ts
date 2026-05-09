import {
  BadRequestException,
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
import { UserAddressCreateDTO } from '../../dtos/userAddress/create.dto';
import { UserAddressFilterDTO } from '../../dtos/userAddress/filter.dto';
import { UserAddressUpdateDTO } from '../../dtos/userAddress/update.dto';
import { UserAddress } from '../../entities/userAddress.entity';
import { UserAddressService } from '../../services/userAddress.service';

@ApiTags('User Address')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/user-addresses')
export class UserAddressInternalController {
  constructor(private readonly service: UserAddressService) { }

  RELATIONS: FindOptionsRelations<UserAddress> = {
    area: { deliveryCharge: true },
  };

  @Get()
  async findAll(@Query() query: UserAddressFilterDTO): Promise<SuccessResponse<UserAddress[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserAddress> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: UserAddressCreateDTO): Promise<UserAddress> {
    if (!body?.userId) throw new BadRequestException('User not selected!')
    if (body?.isDefault) {
      await this.service.userAddressRepository.update({ isDefault: true, userId: body.userId }, { isDefault: false, userId: body.userId })
    }
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UserAddressUpdateDTO,
  ): Promise<UserAddress> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
