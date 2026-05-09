import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalFormController } from './controllers/internal/form.internal.controller';
import { InternalFormSubmitController } from './controllers/internal/formSubmit.internal.controller';
import { WebFormController } from './controllers/web/form.web.controller';
import { WebFormSubmitController } from './controllers/web/formSubmit.web.controller';
import { Form } from './entities/form.entity';
import { FormSubmit } from './entities/formSubmits.entity';
import { FormService } from './services/form.service';
import { FormSubmitService } from './services/formSubmit.service';

const entities = [Form, FormSubmit];
const services = [FormService, FormSubmitService];
const controllers = [];
const subscribers = [];
const webControllers = [];
const internalControllers = [
  InternalFormController,
  InternalFormSubmitController,
  WebFormController,
  WebFormSubmitController,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...webControllers, ...internalControllers],
})
export class FormModule { }
