import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponInternalController } from './controllers/internal/coupon.internal.controller';
import { CouponWebController } from './controllers/web/coupon.web.controller';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { CouponService } from './services/coupon.service';
import { CouponValidationService } from './services/coupon-validation.service';
import { OffersModule } from '../offers/offers.module';

const entities = [Coupon, CouponUsage];
const services = [CouponService, CouponValidationService];
const controllers = [CouponInternalController, CouponWebController];

@Module({
  imports: [TypeOrmModule.forFeature(entities), OffersModule],
  providers: services,
  exports: [CouponValidationService],
  controllers,
})
export class CouponsModule {}
