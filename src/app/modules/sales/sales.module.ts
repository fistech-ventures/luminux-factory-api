import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleInternalController } from './controllers/internal/sale.internal.controller';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SaleService } from './services/sale.service';
import { InvoiceService } from './services/invoice.service';
import { ProductModule } from '../product/product.module';
import { CustomerModule } from '../customer/customer.module';

const entities = [Sale, SaleItem];
const services = [SaleService, InvoiceService];
const subscribers = [];
const webControllers = [];
const internalControllers = [SaleInternalController];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ProductModule, CustomerModule],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class SalesModule {}
