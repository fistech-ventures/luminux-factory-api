import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalConfigInternalController } from './controllers/internal/globalConfig.internal.controller';
import { GlobalConfigWebController } from './controllers/web/globalConfig.web.controller';
import { AnalyticsConfig } from './entities/analyticsConfig.entity';
import { GlobalConfig } from './entities/globalConfig.entity';
import { GlobalConfigService } from './services/globalConfig.service';

const entities = [GlobalConfig, AnalyticsConfig];
const services = [GlobalConfigService];
const subscribers = [];
const controllers = [];
const internalControllers = [GlobalConfigInternalController, GlobalConfigWebController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...internalControllers],
})
export class GlobalConfigModule { }
