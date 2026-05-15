import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CouponUsage } from '../entities/coupon-usage.entity';
import { OfferResolutionService } from '../../offers/services/offer-resolution.service';

@Injectable()
export class CouponValidationService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
    private readonly dataSource: DataSource,
    private readonly offerResolutionService: OfferResolutionService,
  ) {}

  async validate(params: {
    code: string;
    userId?: string;
    cartTotal: number;
    cartItems?: Array<{ productId?: string; variantId?: string; categoryId?: string }>;
  }): Promise<{
    coupon: Coupon;
    discountAmount: number;
  }> {
    const { code, userId, cartTotal, cartItems } = params;

    // Step 1: Find the coupon
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    const now = new Date();

    // Check 1: isActive = true
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    // Check 2: now between startsAt and endsAt
    if (now < coupon.startsAt!) {
      throw new BadRequestException('This coupon is not yet valid');
    }
    if (now > coupon.endsAt!) {
      throw new BadRequestException('This coupon has expired');
    }

    // Check 3: cart total >= minOrderAmount
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Minimum order of ${coupon.minOrderAmount} required for this coupon`,
      );
    }

    // Check 4: maxUsageCount - global quota left
    if (coupon.maxUsageCount && coupon.currentUsageCount! >= coupon.maxUsageCount) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Check 5: per-user limit
    if (userId && coupon.maxUsagePerUser) {
      const userUsageCount = await this.couponUsageRepository.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });
      if (userUsageCount >= coupon.maxUsagePerUser) {
        throw new BadRequestException('You have already used this coupon');
      }
    }

    // Check 6: mutual exclusivity - does any cart item have an active offer?
    if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        const result = await this.offerResolutionService.resolveForItem({
          productId: item.productId,
          variantId: item.variantId,
          categoryId: item.categoryId,
          quantity: 1,
          unitPrice: undefined,
        });
        if (result.defaultOffer) {
          throw new BadRequestException(
            'Cannot combine coupon with product offers. Remove product discounts to use this coupon.',
          );
        }
      }
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(coupon, cartTotal);

    return {
      coupon,
      discountAmount,
    };
  }

  calculateDiscount(coupon: Coupon, cartTotal: number): number {
    if (coupon.discountType === 'FLAT') {
      return coupon.discountValue || 0;
    }

    if (coupon.discountType === 'PERCENTAGE') {
      const discount = (cartTotal * (coupon.discountValue || 0)) / 100;
      if (coupon.maxDiscountCap) {
        return Math.min(discount, coupon.maxDiscountCap);
      }
      return discount;
    }

    return 0;
  }

  async redeem(params: {
    code: string;
    userId?: string;
    orderId?: string;
    discountAmount: number;
  }): Promise<CouponUsage> {
    const { code, userId, orderId, discountAmount } = params;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Re-validate coupon (things may have changed)
      const coupon = await queryRunner.manager.findOne(Coupon, {
        where: { code: code.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Coupon is no longer valid');
      }

      const now = new Date();
      if (now < coupon.startsAt! || now > coupon.endsAt!) {
        throw new BadRequestException('Coupon is no longer valid');
      }

      if (coupon.maxUsageCount && coupon.currentUsageCount! >= coupon.maxUsageCount) {
        throw new BadRequestException('Coupon has reached its usage limit');
      }

      if (userId && coupon.maxUsagePerUser) {
        const userUsageCount = await queryRunner.manager.count(CouponUsage, {
          where: { couponId: coupon.id, userId },
        });
        if (userUsageCount >= coupon.maxUsagePerUser) {
          throw new BadRequestException('You have already used this coupon');
        }
      }

      // Atomic increment of currentUsageCount with race condition protection
      const updateResult = await queryRunner.manager
        .createQueryBuilder()
        .update(Coupon)
        .set({ currentUsageCount: () => 'currentUsageCount + 1' })
        .where('id = :id', { id: coupon.id })
        .andWhere('currentUsageCount < :maxUsageCount', {
          maxUsageCount: coupon.maxUsageCount || 999999999,
        })
        .execute();

      if (updateResult.affected === 0) {
        throw new BadRequestException('Coupon quota was taken by another user');
      }

      // Create CouponUsage record
      const usage = await queryRunner.manager.save(CouponUsage, {
        couponId: coupon.id,
        userId,
        orderId,
        usedAt: now,
        discountAmount,
      });

      await queryRunner.commitTransaction();
      return usage;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
