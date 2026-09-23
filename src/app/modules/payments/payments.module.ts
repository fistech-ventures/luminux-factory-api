import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentInternalController } from './controllers/internal/payment.internal.controller';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './services/payment.service';
import { SalesModule } from '../sales/sales.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { CustomerModule } from '../customer/customer.module';
import { SupplierModule } from '../supplier/supplier.module';
import { EmployeeModule } from '../employee/employee.module';

const entities = [Payment];
const services = [PaymentService];
const subscribers = [];
const webControllers = [];
const internalControllers = [PaymentInternalController];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    SalesModule,
    PurchaseModule,
    CustomerModule,
    SupplierModule,
    EmployeeModule,
  ],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class PaymentsModule {}
