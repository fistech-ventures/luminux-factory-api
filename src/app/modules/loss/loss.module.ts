import { Module } from '@nestjs/common';
import { ProfitModule } from '../profit/profit.module';
import { LossInternalController } from './controllers/internal/loss.internal.controller';
import { LossService } from './services/loss.service';

const services = [LossService];
const subscribers = [];
const webControllers = [];
const internalControllers = [LossInternalController];

@Module({
  imports: [ProfitModule],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class LossModule {}