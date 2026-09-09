import { Module } from '@nestjs/common';
import { DashboardInternalController } from './controllers/internal/dashboard.internal.controller';
import { DashboardService } from './services/dashboard.service';
import { SalesModule } from '../sales/sales.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { ExpenseModule } from '../expense/expense.module';
import { ProductModule } from '../product/product.module';

const services = [DashboardService];
const subscribers = [];
const webControllers = [];
const internalControllers = [DashboardInternalController];

@Module({
  imports: [SalesModule, PurchaseModule, ExpenseModule, ProductModule],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class DashboardModule {}