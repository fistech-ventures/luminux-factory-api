import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierInternalController } from './controllers/internal/supplier.internal.controller';
import { Supplier } from './entities/supplier.entity';
import { SupplierService } from './services/supplier.service';

const entities = [Supplier];
const services = [SupplierService];
const subscribers = [];
const webControllers = [];
const internalControllers = [SupplierInternalController];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class SupplierModule {}
