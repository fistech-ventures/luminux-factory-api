import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferInternalController } from './controllers/internal/offer.internal.controller';
import { OfferWebController } from './controllers/web/offer.web.controller';
import { DiscountRule } from './entities/discount-rule.entity';
import { Offer } from './entities/offer.entity';
import { OfferScope } from './entities/offer-scope.entity';
import { DiscountCalculatorService } from './services/discount-calculator.service';
import { OfferResolutionService } from './services/offer-resolution.service';
import { OfferService } from './services/offer.service';
import { Product } from '../product/entities/product.entity';
import { ProductVariantOption } from '../product/entities/productVariantOption.entity';

const entities = [Offer, DiscountRule, OfferScope, Product, ProductVariantOption];
const services = [OfferService, OfferResolutionService, DiscountCalculatorService];
const controllers = [OfferInternalController, OfferWebController];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: services,
  exports: [OfferResolutionService, DiscountCalculatorService],
  controllers,
})
export class OffersModule {}
