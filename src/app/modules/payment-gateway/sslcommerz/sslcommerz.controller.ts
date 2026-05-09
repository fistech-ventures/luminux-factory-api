import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ISSLCommerzInitPaymentRequest } from './sslcommerz.interfaces';
import { SSLCommerzService } from './sslcommerz.service';

@ApiTags('SSLCommerz')
@Controller('payment-gateway/sslcommerz')
export class SSLCommerzController {
  constructor(private readonly service: SSLCommerzService) {}

  @Post('/init')
  async init(@Body() body: ISSLCommerzInitPaymentRequest): Promise<any> {
    return this.service.initPayment(body);
  }
}
