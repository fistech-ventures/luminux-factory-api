import { getDiscountPercentageLabel } from '@src/shared';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ENUM_PRODUCT_DISCOUNT_TYPE } from '../const';

@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  constructor(
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof Product {
    return Product;
  }

  async beforeInsert(event: InsertEvent<Product>): Promise<void> {
    if (event.entity.slug) {
      event.entity.slug = event.entity.slug.trim().toLowerCase();
    }
  }

  async beforeUpdate(event: InsertEvent<Product>): Promise<void> {
    if (event.entity.slug) {
      event.entity.slug = event.entity.slug.trim().toLowerCase();
    }
  }

  async afterLoad(entity: any): Promise<void> {
    if (entity?.mrp && entity?.discountAmount && entity.discountType === ENUM_PRODUCT_DISCOUNT_TYPE.FLAT) {
      entity.discountPercentageLabel = getDiscountPercentageLabel(entity.mrp, entity.discountAmount)
    } else if (entity?.mrp && entity?.discountAmount && entity.discountType === ENUM_PRODUCT_DISCOUNT_TYPE.PERCENTAGE) {
      entity.discountPercentageLabel = `${entity.discountAmount}%`
    }
  }
}
