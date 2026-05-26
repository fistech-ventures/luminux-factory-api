import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactInternalController } from './controllers/internal/contact.internal.controller';
import { ContactWebController } from './controllers/web/contact.web.controller';
import { Contact } from './entities/contact.entity';
import { ContactService } from './services/contact.service';

const entities = [Contact];
const services = [ContactService];
const subscribers = [];
const webControllers = [ContactWebController];
const internalControllers = [ContactInternalController];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class ContactModule { }
