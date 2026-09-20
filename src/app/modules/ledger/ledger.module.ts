import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerInternalController } from './controllers/internal/ledger.internal.controller';
import { Ledger } from './entities/ledger.entity';
import { LedgerService } from './services/ledger.service';
import { Sale } from '../sales/entities/sale.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

const entities = [Ledger, Sale, Purchase, Payment, Customer, Supplier];
const services = [LedgerService];
const subscribers = [];
const webControllers = [];
const internalControllers = [LedgerInternalController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class LedgerModule {}
