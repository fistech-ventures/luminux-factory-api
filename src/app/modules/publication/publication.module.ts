import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationInternalController } from './controllers/internal/publication.internal.controller';
import { PublicationWebController } from './controllers/web/publication.web.controller';
import { Publication } from './entities/publication.entity';
import { PublicationService } from './services/publication.service';

const entities = [Publication];
const services = [PublicationService];
const subscribers = [];
const webControllers = [PublicationWebController];
const internalControllers = [PublicationInternalController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class PublicationModule { }
