import { Injectable } from '@nestjs/common';
import { DiscountRule } from '../entities/discount-rule.entity';

@Injectable()
export class DiscountCalculatorService {
  calculate(rule: DiscountRule, unitPrice: number, quantity: number): {
    discountPerUnit: number;
    freeUnits: number;
    totalSaving: number;
  } {
    let discountPerUnit = 0;
    let freeUnits = 0;

    switch (rule.type) {
      case 'FLAT':
        discountPerUnit = rule.discountValue || 0;
        freeUnits = 0;
        break;

      case 'PERCENTAGE':
        discountPerUnit = (unitPrice * (rule.discountValue || 0)) / 100;
        if (rule.maxDiscountCap) {
          discountPerUnit = Math.min(discountPerUnit, rule.maxDiscountCap);
        }
        freeUnits = 0;
        break;

      case 'BOGO':
        discountPerUnit = 0;
        freeUnits = Math.floor(quantity / 2);
        break;

      case 'BUY_X_GET_Y':
        discountPerUnit = 0;
        if (rule.buyQuantity && rule.getQuantity) {
          freeUnits = Math.floor(quantity / rule.buyQuantity) * rule.getQuantity;
        }
        break;

      case 'BUY_X_GET_PCT':
        if (rule.buyQuantity && quantity < rule.buyQuantity) {
          discountPerUnit = 0;
          freeUnits = 0;
        } else {
          discountPerUnit = (unitPrice * (rule.getPercentage || 0)) / 100;
          freeUnits = 0;
        }
        break;

      default:
        discountPerUnit = 0;
        freeUnits = 0;
    }

    const totalSaving = discountPerUnit * quantity + freeUnits * unitPrice;

    return {
      discountPerUnit,
      freeUnits,
      totalSaving,
    };
  }
}
