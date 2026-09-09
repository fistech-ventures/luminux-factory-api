import { Module } from '@nestjs/common';
import { AccountsInternalController } from './controllers/internal/accounts.internal.controller';
import { AccountsService } from './services/accounts.service';
import { SalesModule } from '../sales/sales.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { ExpenseModule } from '../expense/expense.module';
import { PaymentsModule } from '../payments/payments.module';

const services = [AccountsService];
const subscribers = [];
const webControllers = [];
const internalControllers = [AccountsInternalController];

@Module({
  imports: [SalesModule, PurchaseModule, ExpenseModule, PaymentsModule],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class AccountsModule {}