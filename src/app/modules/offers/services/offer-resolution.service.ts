import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DiscountCalculatorService } from './discount-calculator.service';
import { DiscountRule } from '../entities/discount-rule.entity';
import { Offer } from '../entities/offer.entity';
import { OfferScope } from '../entities/offer-scope.entity';

@Injectable()
export class OfferResolutionService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(OfferScope)
    private readonly offerScopeRepository: Repository<OfferScope>,
    @InjectRepository(DiscountRule)
    private readonly discountRuleRepository: Repository<DiscountRule>,
    private readonly discountCalculatorService: DiscountCalculatorService,
    private readonly dataSource: DataSource,
  ) {}

  async resolveForItem(params: {
    productId?: string;
    variantId?: string;
    categoryId?: string;
    quantity: number;
    unitPrice?: number;
  }): Promise<{
    eligibleOffers: Array<Offer & { savingAmount: number; discountTag?: string }>;
    defaultOffer: (Offer & { savingAmount: number; discountTag?: string }) | null;
  }> {
    const { productId, variantId, categoryId, quantity, unitPrice } = params;
    const now = new Date();

    // Query active offers within date range
    const offers = await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.isActive = :isActive', { isActive: true })
      .andWhere('offer.startsAt <= :now', { now })
      .andWhere('offer.endsAt >= :now', { now })
      .leftJoinAndSelect('offer.rules', 'rules')
      .leftJoinAndSelect('offer.scopes', 'scopes')
      .orderBy('offer.priority', 'DESC')
      .getMany();

    // Filter offers by scope matching
    const eligibleOffers: Array<Offer & { savingAmount: number; discountTag?: string }> = [];

    for (const offer of offers) {
      const isEligible = await this.checkOfferEligibility(offer, {
        productId,
        variantId,
        categoryId,
      });

      if (isEligible) {
        // Calculate saving amount for each rule and take the maximum
        let maxSaving = 0;
        for (const rule of offer.rules || []) {
          if (unitPrice) {
            const result = this.discountCalculatorService.calculate(rule, unitPrice, quantity);
            maxSaving = Math.max(maxSaving, result.totalSaving);
          }
        }

        eligibleOffers.push({
          ...offer,
          savingAmount: maxSaving,
          discountTag: offer.tag,
        });
      }
    }

    // Default offer is the highest priority (first in array)
    const defaultOffer = eligibleOffers.length > 0 ? eligibleOffers[0] : null;

    return {
      eligibleOffers,
      defaultOffer,
    };
  }

  private async checkOfferEligibility(
    offer: Offer,
    params: { productId?: string; variantId?: string; categoryId?: string },
  ): Promise<boolean> {
    const { productId, variantId, categoryId } = params;
    const scopes = offer.scopes || [];

    if (scopes.length === 0) {
      return false;
    }

    // Check if any scope matches
    for (const scope of scopes) {
      switch (scope.scopeType) {
        case 'ALL_PRODUCTS':
          return true;

        case 'CATEGORY':
          if (scope.categoryId && categoryId === scope.categoryId) {
            return true;
          }
          break;

        case 'PRODUCT':
          if (scope.productId && productId === scope.productId) {
            return true;
          }
          break;

        case 'VARIANT':
          if (scope.productVariantId && variantId === scope.productVariantId) {
            return true;
          }
          break;
      }
    }

    return false;
  }
}
