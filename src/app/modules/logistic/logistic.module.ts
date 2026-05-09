import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceProviderInternalController } from './controllers/internal/serviceProvider.internal.controller';
import { ServiceProvider } from './entities/serviceProvider.entity';
import { ServiceProviderService } from './services/serviceProvider.service';
import { ProviderServiceRequest } from './entities/providerServiceRequest.entity';
import { ProviderServiceRequestService } from './services/providerServiceRequest.service';

const entities = [ServiceProvider, ProviderServiceRequest];
const services = [ServiceProviderService, ProviderServiceRequestService];
const subscribers = [];
const webControllers = [];
const internalControllers = [ServiceProviderInternalController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class LogisticModule { }
