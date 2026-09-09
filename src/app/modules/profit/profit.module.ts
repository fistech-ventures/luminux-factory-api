import { Module } from '@nestjs/common';
import { ProfitInternalController } from './controllers/internal/profit.internal.controller';
import { ProfitService } from './services/profit.service';

const services = [ProfitService];
const subscribers = [];
const webControllers = [];
const internalControllers = [ProfitInternalController];

@Module({
  imports: [],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class ProfitModule {}