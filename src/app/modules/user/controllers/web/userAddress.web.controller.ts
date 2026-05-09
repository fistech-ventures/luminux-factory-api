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
import { AuthUser } from '@src/app/decorators';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { UserAddressCreateDTO } from '../../dtos/userAddress/create.dto';
import { UserAddressFilterDTO } from '../../dtos/userAddress/filter.dto';
import { UserAddressUpdateDTO } from '../../dtos/userAddress/update.dto';
import { UserAddress } from '../../entities/userAddress.entity';
import { UserAddressService } from '../../services/userAddress.service';

@ApiTags('User Address')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/user-addresses')
export class UserAddressWebController {
  constructor(private readonly service: UserAddressService) { }

  RELATIONS: FindOptionsRelations<UserAddress> = {
    area: { deliveryCharge: true },
  };

  @Get()
  async findAll(@Query() query: UserAddressFilterDTO, @AuthUser() authUser: IAuthUser): Promise<SuccessResponse<UserAddress[]>> {
    query['userId'] = authUser.id
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserAddress> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: UserAddressCreateDTO, @AuthUser() authUser: IAuthUser): Promise<UserAddress> {
    if (body?.isDefault) {
      await this.service.userAddressRepository.update({ isDefault: true, userId: authUser.id }, { isDefault: false, userId: authUser.id })
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
