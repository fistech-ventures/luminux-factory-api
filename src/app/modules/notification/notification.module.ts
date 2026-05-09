import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailInternalController } from './controllers/internal/email.internal.controller';
import { EmailGatewayInternalController } from './controllers/internal/emailGateway.internal.controller';
import { SmsInternalController } from './controllers/internal/sms.internal.controller';
import { SmsGatewayInternalController } from './controllers/internal/smsGateway.internal.controller';
import { EmailGateway } from './entities/emailGateway.entity';
import { SmsGateway } from './entities/smsGateway.entity';
import { EmailService } from './services/email.service';
import { EmailGatewayService } from './services/emailGateway.service';
import { SmsService } from './services/sms.service';
import { SmsGatewayService } from './services/smsGateway.service';

const entities = [EmailGateway, SmsGateway];
const services = [EmailGatewayService, SmsGatewayService, EmailService, SmsService];
const subscribers = [];

const controllers = [];
const appControllers = [];
const internalControllers = [
  EmailGatewayInternalController,
  SmsGatewayInternalController,
  EmailInternalController,
  SmsInternalController,
];

const modules = [HttpModule];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...internalControllers, ...appControllers],
})
export class NotificationModule {}
