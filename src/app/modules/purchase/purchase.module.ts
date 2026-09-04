import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseInternalController } from './controllers/internal/purchase.internal.controller';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseService } from './services/purchase.service';
import { ProductModule } from '../product/product.module';

const entities = [Purchase, PurchaseItem];
const services = [PurchaseService];
const subscribers = [];
const webControllers = [];
const internalControllers = [PurchaseInternalController];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ProductModule],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class PurchaseModule {}
