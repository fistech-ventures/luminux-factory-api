import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../../services/payment.service';
import { CreatePaymentDTO } from '../../dtos/create.dto';
import { UpdatePaymentDTO } from '../../dtos/update.dto';
import { FilterPaymentDTO } from '../../dtos/filter.dto';
import { Payment } from '../../entities/payment.entity';
import { InternalRequestInterceptor } from '@src/app/interceptors';

@ApiTags('Payments')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/payments')
export class PaymentInternalController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() payload: CreatePaymentDTO): Promise<Payment> {
    return await this.paymentService.createPayment(payload);
  }

  @Get()
  async findAll(@Query() query: FilterPaymentDTO): Promise<any> {
    return await this.paymentService.findAllWithDetails(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Payment> {
    return await this.paymentService.findOneWithDetails(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdatePaymentDTO): Promise<Payment> {
    return await this.paymentService.updatePayment(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.paymentService.deleteOneBase(id);
  }
}
