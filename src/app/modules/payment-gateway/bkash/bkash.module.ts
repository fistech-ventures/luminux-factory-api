import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { BKASH_CLIENT } from './bkash.constants';
import { BkashController } from './bkash.controller';
import { IBkashOptions } from './bkash.interfaces';
import { BkashService } from './bkash.service';

@Global()
@Module({})
export class BkashModule {
  static register(options: IBkashOptions): DynamicModule {
    return {
      module: BkashModule,
      providers: [
        {
          provide: BKASH_CLIENT,
          useFactory: () => {
            return new BkashService({
              tokenUrl: options.tokenUrl,
              createUrl: options.createUrl,
              executeUrl: options.executeUrl,
              paymentStatusUrl: options.paymentStatusUrl,
              searchTransactionUrl: options.searchTransactionUrl,
              refundTransactionUrl: options.refundTransactionUrl,
              webHookUrl: options.webHookUrl,
              appKey: options.appKey,
              appSecret: options.appSecret,
              username: options.username,
              password: options.password,
            });
          },
        },
        BkashService,
      ],
      imports: [
        HttpModule,
        // HttpModule.register({
        //   timeout: +ENV.REQUEST_TIMEOUT_MS,
        //   timeoutErrorMessage: 'Request Timeout',
        // }),
      ],
      controllers: [BkashController],
      exports: [BkashService],
    };
  }
}
