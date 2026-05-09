import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { PaymentGatewayLog } from '../entities/paymentGatewayLog.entity';
import { PaymentGatewayLogService } from '../services/paymentGatewayLog.service';

@ApiTags('Payment Gateway Log')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/payment-gateway-logs')
export class PaymentGatewayLogInternalController {
  constructor(private readonly service: PaymentGatewayLogService) { }

  @Public()
  @Get(':code')
  async findByCode(@Param('code') code: string): Promise<PaymentGatewayLog> {
    return this.service.findOne({ where: { code } });
  }
}
