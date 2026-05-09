import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { SSL_COMMERZ_CLIENT } from './sslcommerz.constants';
import { SSLCommerzController } from './sslcommerz.controller';
import { ISSLCommerzOptions } from './sslcommerz.interfaces';
import { SSLCommerzService } from './sslcommerz.service';

@Global()
@Module({})
export class SSLCommerzModule {
  static register(options: ISSLCommerzOptions): DynamicModule {
    return {
      module: SSLCommerzModule,
      providers: [
        {
          provide: SSL_COMMERZ_CLIENT,
          useFactory: () => {
            return new SSLCommerzService({
              storeId: options.storeId,
              storePassword: options.storePassword,
              basePaymentUrl: options.basePaymentUrl,
              basePaymentValidationUrl: options.basePaymentValidationUrl,
            });
          },
        },
        SSLCommerzService,
      ],
      imports: [
        HttpModule,
        // HttpModule.register({
        //   timeout: +ENV.REQUEST_TIMEOUT_MS,
        //   timeoutErrorMessage: 'Request Timeout',
        // }),
      ],
      controllers: [SSLCommerzController],
      exports: [SSLCommerzService],
    };
  }
}
