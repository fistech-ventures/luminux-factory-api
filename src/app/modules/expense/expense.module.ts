import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseInternalController } from './controllers/internal/expense.internal.controller';
import { Expense } from './entities/expense.entity';
import { ExpenseService } from './services/expense.service';

const entities = [Expense];
const services = [ExpenseService];
const subscribers = [];
const webControllers = [];
const internalControllers = [ExpenseInternalController];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class ExpenseModule {}
