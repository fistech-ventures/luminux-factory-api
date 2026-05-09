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
import { PaymentAccountCreateDTO } from '../dtos/paymentAccount/create.dto';
import { PaymentAccountFilterDTO } from '../dtos/paymentAccount/filter.dto';
import { PaymentAccountUpdateDTO } from '../dtos/paymentAccount/update.dto';
import { PaymentAccount } from '../entities/paymentAccount.entity';
import { PaymentAccountService } from '../services/paymentAccount.service';

@ApiTags('Payment Account')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/payment-accounts')
export class PaymentAccountInternalController {
  constructor(private readonly service: PaymentAccountService) { }
  RELATIONS = {};

  @Get()
  async findAll(
    @Query() query: PaymentAccountFilterDTO,
  ): Promise<SuccessResponse | PaymentAccount[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PaymentAccount> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: PaymentAccountCreateDTO): Promise<PaymentAccount> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: PaymentAccountUpdateDTO,
  ): Promise<PaymentAccount> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
