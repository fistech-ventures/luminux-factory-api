import {
  Body,
  ConflictException,
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

import { PaymentGatewayCreateDTO } from '../dtos/paymentGateway/create.dto';
import { PaymentGatewayFilterDTO } from '../dtos/paymentGateway/filter.dto';
import { PaymentGatewayUpdateDTO } from '../dtos/paymentGateway/update.dto';
import { PaymentGateway } from '../entities/paymentGateway.entity';
import { PaymentAccountService } from '../services/paymentAccount.service';
import { PaymentGatewayService } from '../services/paymentGateway.service';

@ApiTags('Payment Gateway')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/payment-gateways')
export class PaymentGatewayInternalController {
  constructor(private readonly service: PaymentGatewayService,
    private readonly paymentAccountService: PaymentAccountService
  ) { }
  RELATIONS: FindOptionsRelations<PaymentGateway> = {};

  @Get()
  async findAll(
    @Query() query: PaymentGatewayFilterDTO,
  ): Promise<SuccessResponse<PaymentGateway[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PaymentGateway> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: PaymentGatewayCreateDTO): Promise<PaymentGateway> {
    const isExist = await this.service.findOne({ where: { paymentGateway: body.paymentGateway } });
    if (isExist)
      throw new ConflictException(`Payment gateway ${body.paymentGateway} already added!`);
    const createdGateway = await this.service.createOneBase(body, { relations: this.RELATIONS });
    await this.paymentAccountService.createOneBase({
      title: body.title,
      isDefault: true,
      gatewayId: createdGateway.id,
      accountHolder: 'Default Account Holder',
      accountNo: '1234567890',
      accountType: 'business',
    });
    return createdGateway
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: PaymentGatewayUpdateDTO,
  ): Promise<PaymentGateway> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
