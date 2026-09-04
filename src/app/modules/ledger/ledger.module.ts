import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerInternalController } from './controllers/internal/ledger.internal.controller';
import { Ledger } from './entities/ledger.entity';
import { LedgerService } from './services/ledger.service';

const entities = [Ledger];
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
