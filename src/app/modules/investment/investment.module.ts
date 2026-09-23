import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { InvestmentInternalController } from './controllers/internal/investment.internal.controller';
import { Investment } from './entities/investment.entity';
import { InvestmentService } from './services/investment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Investment, Employee])],
  providers: [InvestmentService],
  exports: [InvestmentService, TypeOrmModule],
  controllers: [InvestmentInternalController],
})
export class InvestmentModule {}
