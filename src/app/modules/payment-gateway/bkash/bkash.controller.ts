import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BkashService } from './bkash.service';
import { BkashPaymentRequestDTO } from './requests/bkash-payment-request.dto';

@ApiTags('Bkash')
@Controller('payment-gateway/bkash')
export class BkashController {
  constructor(private readonly service: BkashService) { }

  @Post('/token')
  async token(): Promise<any> {
    return this.service.createToken();
  }

  @Post('/init')
  async init(@Body() body: BkashPaymentRequestDTO): Promise<any> {
    return this.service.initPayment({
      invoiceCode: body.invoiceCode,
      amount: body.amount,
    });
  }
}
