import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@src/database/database.module';
import { ExceptionFilter } from './filters';
import { HelpersModule } from './helpers/helpers.module';
import { GlobalRequestInterceptor, ResponseInterceptor } from './interceptors';
import { RedisModule } from './modules/@redis/redis.module';
import { AclModule } from './modules/acl/acl.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/local-auth.guard';
import { AuthorModule } from './modules/author/author.module';
import { CMSModule } from './modules/cms/cms.module';
import { CommonModule } from './modules/common/common.module';
import { FormModule } from './modules/form/form.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { LogisticModule } from './modules/logistic/logistic.module';
import { NoteModule } from './modules/note/note.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { OffersModule } from './modules/offers/offers.module';
import { PaymentGatewayModule } from './modules/payment-gateway/paymentGateway.module';
import { ProductModule } from './modules/product/product.module';
import { PublicationModule } from './modules/publication/publication.module';
import { SupportModule } from './modules/support/support.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';
import { UniqueValidatorPipe } from './pipes/uniqueValidator.pipe';

const MODULES = [
  DatabaseModule,
  HelpersModule,
  ScheduleModule.forRoot(),
  AuthModule,
  RedisModule,
  GalleryModule,
  AclModule,
  UserModule,
  CommonModule,
  NotificationModule,
  PaymentGatewayModule,
  TransactionModule,
  AuthorModule,
  ProductModule,
  PublicationModule,
  CartModule,
  OrderModule,
  OffersModule,
  CMSModule,
  FormModule,
  SupportModule,
  LogisticModule,
  NoteModule
];
const PIPES = [UniqueValidatorPipe];

@Module({
  imports: [...MODULES],
  controllers: [],
  providers: [
    ...PIPES,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalRequestInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule { }
