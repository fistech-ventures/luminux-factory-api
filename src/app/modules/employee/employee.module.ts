import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeInternalController } from './controllers/internal/employee.internal.controller';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './services/employee.service';

const entities = [Employee];
const services = [EmployeeService];
const subscribers = [];
const webControllers = [];
const internalControllers = [EmployeeInternalController];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class EmployeeModule {}
