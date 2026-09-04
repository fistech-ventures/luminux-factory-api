import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerInternalController } from './controllers/internal/customer.internal.controller';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './services/customer.service';

const entities = [Customer];
const services = [CustomerService];
const subscribers = [];
const webControllers = [];
const internalControllers = [CustomerInternalController];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class CustomerModule {}
