import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaInternalController } from './controller/internal/area.internal.controller';
import { DeliveryChargeInternalController } from './controller/internal/deliveryCharge.internal.controller';
import { QuoteInternalController } from './controller/internal/quote.internal.controller';
import { AreaWebController } from './controller/web/area.web.controller';
import { Area } from './entities/area.entity';
import { DeliveryCharge } from './entities/deliveryCharge.entity';
import { Quote } from './entities/quote.entity';
import { AreaService } from './services/area.service';
import { DeliveryChargeService } from './services/deliveryCharge.service';
import { QuoteService } from './services/quote.service';

const entities = [DeliveryCharge, Area, Quote];
const services = [
  DeliveryChargeService,
  AreaService,
  QuoteService,
];
const subscribers = [];

const internalControllers = [
  DeliveryChargeInternalController,
  AreaInternalController,
  QuoteInternalController
];
const webControllers = [
  AreaWebController,
];

const modules = [];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [
    ...internalControllers,
    ...webControllers,
  ],
})
export class CommonModule { }
