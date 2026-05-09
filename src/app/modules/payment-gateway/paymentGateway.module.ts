import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV } from '@src/env';
import { BkashModule } from './bkash/bkash.module';
import { PaymentAccountInternalController } from './controllers/paymentAccount.internal.controller';
import { PaymentGatewayInternalController } from './controllers/paymentGateway.internal.controller';
import { PaymentGatewayLogInternalController } from './controllers/paymentGatewayLog.internal.controller';
import { PaymentAccount } from './entities/paymentAccount.entity';
import { PaymentGateway } from './entities/paymentGateway.entity';
import { PaymentGatewayLog } from './entities/paymentGatewayLog.entity';
import { PaymentAccountService } from './services/paymentAccount.service';
import { PaymentGatewayService } from './services/paymentGateway.service';
import { PaymentGatewayLogService } from './services/paymentGatewayLog.service';
import { PaymentGatewayRequestService } from './services/paymentGatewayRequest.service';
import { SSLCommerzModule } from './sslcommerz/sslcommerz.module';
import { PaymentGatewayRequestWebController } from './controllers/paymentGatewayRequest.web.controller';

const entities = [PaymentGatewayLog, PaymentGateway, PaymentAccount];
const services = [PaymentGatewayRequestService, PaymentGatewayService, PaymentAccountService, PaymentGatewayLogService];
const webControllers = [PaymentGatewayRequestWebController];
const internalControllers = [PaymentGatewayInternalController, PaymentGatewayLogInternalController, PaymentAccountInternalController];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    HttpModule,
    SSLCommerzModule.register({
      storeId: ENV.sslCommerz.SSL_COMMERZ_STORE_ID,
      storePassword: ENV.sslCommerz.SSL_COMMERZ_STORE_PASSWORD,
      basePaymentUrl: ENV.sslCommerz.SSL_COMMERZ_BASE_PAYMENT_URL,
      basePaymentValidationUrl: ENV.sslCommerz.SSL_COMMERZ_BASE_PAYMENT_VALIDATION_URL,
    }),
    BkashModule.register({
      tokenUrl: ENV.bkash.BKASH_TOKEN_URL,
      createUrl: ENV.bkash.BKASH_CREATE_URL,
      executeUrl: ENV.bkash.BKASH_EXECUTE_URL,
      paymentStatusUrl: ENV.bkash.BKASH_PAYMENT_STATUS_URL,
      searchTransactionUrl: ENV.bkash.BKASH_SEARCH_TRANSACTION_URL,
      refundTransactionUrl: ENV.bkash.BKASH_REFUND_TRANSACTION_URL,
      webHookUrl: ENV.bkash.BKASH_WEB_HOOK_URL,
      appKey: ENV.bkash.BKASH_APP_KEY,
      appSecret: ENV.bkash.BKASH_APP_SECRET,
      username: ENV.bkash.BKASH_USERNAME,
      password: ENV.bkash.BKASH_PASSWORD,
    }),
  ],
  providers: [...services],
  controllers: [...webControllers, ...internalControllers],
  exports: [...services],
})
export class PaymentGatewayModule { }
