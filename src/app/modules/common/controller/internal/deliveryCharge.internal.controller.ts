import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { DeliveryChargeCreateDTO } from '../../dtos/deliveryCharge/create.dto';
import { FilterDeliveryChargeDTO } from '../../dtos/deliveryCharge/filter.dto';
import { DeliveryChargeUpdateDTO } from '../../dtos/deliveryCharge/update.dto';
import { DeliveryCharge } from '../../entities/deliveryCharge.entity';
import { DeliveryChargeService } from '../../services/deliveryCharge.service';

@ApiTags('Address#DeliveryCharge')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/delivery-charges')
export class DeliveryChargeInternalController {
  constructor(private readonly service: DeliveryChargeService) { }
  RELATIONS: FindOptionsRelations<DeliveryCharge> = {};

  @Get()
  async findAll(@Query() query: FilterDeliveryChargeDTO): Promise<SuccessResponse<DeliveryCharge[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<DeliveryCharge> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: DeliveryChargeCreateDTO): Promise<DeliveryCharge> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: DeliveryChargeUpdateDTO,
  ): Promise<DeliveryCharge> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
