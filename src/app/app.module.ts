import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@src/database/database.module';
import { ExceptionFilter } from './filters';
import { HelpersModule } from './helpers/helpers.module';
import { GlobalRequestInterceptor, ResponseInterceptor } from './interceptors';
import { AclModule } from './modules/acl/acl.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/local-auth.guard';
import { GalleryModule } from './modules/gallery/gallery.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ProductModule } from './modules/product/product.module';
import { RawMaterialModule } from './modules/rawMaterial/rawMaterial.module';
import { ProductionModule } from './modules/production/production.module';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { SalesModule } from './modules/sales/sales.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ProfitModule } from './modules/profit/profit.module';
import { LossModule } from './modules/loss/loss.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UniqueValidatorPipe } from './pipes/uniqueValidator.pipe';

const MODULES = [
  DatabaseModule,
  HelpersModule,
  ScheduleModule.forRoot(),
  AuthModule,
  GalleryModule,
  AclModule,
  UserModule,
  NotificationModule,
  ProductModule,
  RawMaterialModule,
  ProductionModule,
  CustomerModule,
  SupplierModule,
  EmployeeModule,
  InvestmentModule,
  ExpenseModule,
  PurchaseModule,
  SalesModule,
  LedgerModule,
  PaymentsModule,
  AccountsModule,
  ProfitModule,
  LossModule,
  DashboardModule,
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
