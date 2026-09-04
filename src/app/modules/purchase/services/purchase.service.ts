import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { DataSource, Repository } from 'typeorm';
import { CreatePurchaseDTO } from '../dtos/create.dto';
import { UpdatePurchaseDTO } from '../dtos/update.dto';
import { PurchaseItemDTO } from '../dtos/purchase-item.dto';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';
import { ProductFactory } from '../factories/product.factory';
import { ProductService } from '../../product/services/product.service';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';
import { LedgerService } from '../../ledger/services/ledger.service';

@Injectable()
export class PurchaseService extends BaseService<Purchase> {
  constructor(
    @InjectRepository(Purchase)
    private readonly _repo: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly _itemRepo: Repository<PurchaseItem>,
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
    private readonly ledgerService: LedgerService,
  ) {
    super(_repo);
  }

  async createPurchase(payload: CreatePurchaseDTO): Promise<Purchase> {
    const queryRunner = await startTransaction(this.dataSource);

    try {
      const { items, paidAmount, ...restPayload } = payload;

      let totalQuantity = 0;
      let totalPurchaseAmount = 0;

      // First resolve each product (create new products when not in inventory)
      // and compute the purchase totals.
      const resolvedItems: Array<
        PurchaseItemDTO & { productId: string; calculatedSourcingPrice: number }
      > = [];

      for (const item of items) {
        const calculatedSourcingPrice = (item.totalProductCost + item.otherCost) / item.quantity;

        let productId: string;

        if (item.productId) {
          productId = item.productId;
          await this.productService.isExist({ id: item.productId as any });

          // Variant purchase: add stock to the specific variant option and
          // keep the product-level stock in sync (it mirrors the sum of the
          // variant stocks). Sourcing price is still a product-level figure.
          if (item.variantId) {
            const variant = await queryRunner.manager.findOne(ProductVariantOption, {
              where: { id: item.variantId, productId },
            });
            if (!variant) {
              throw new BadRequestException(
                'Variant not found for the given product',
              );
            }
            await queryRunner.manager.update(
              ProductVariantOption,
              { id: variant.id },
              { stockQuantity: (variant.stockQuantity || 0) + item.quantity },
            );
          }

          await this.productService.updateSourcingPrice(item.productId, calculatedSourcingPrice);
          await this.productService.updateStock(item.productId, item.quantity);
        } else {
          const productCode = item.productCode?.trim();
          if (!productCode) {
            throw new BadRequestException(
              `Product code is required to create the new product: ${item.productName}`,
            );
          }
          await this.productService.assertUniqueProductCode(productCode);

          const newProduct = ProductFactory.createProduct(
            productCode,
            item.productName,
            calculatedSourcingPrice,
            calculatedSourcingPrice,
            item.quantity,
          );
          const createdProduct = await queryRunner.manager.save(newProduct);
          productId = createdProduct.id;
        }

        totalQuantity += item.quantity;
        totalPurchaseAmount += item.totalProductCost + item.otherCost;

        resolvedItems.push({ ...item, productId, calculatedSourcingPrice });
      }

      const dueAmount = totalPurchaseAmount - paidAmount;

      // Save the purchase first so the items can reference its id.
      const purchase = queryRunner.manager.create(Purchase, {
        ...restPayload,
        totalQuantity,
        totalPurchaseAmount,
        paidAmount,
        dueAmount,
      });

      const savedPurchase = await queryRunner.manager.save(purchase);

      // Now insert the items with the real purchaseId.
      const purchaseItems: PurchaseItem[] = [];

      for (const item of resolvedItems) {
        const purchaseItem = queryRunner.manager.create(PurchaseItem, {
          purchaseId: savedPurchase.id,
          productId: item.productId,
          variantId: item.variantId ?? null,
          productName: item.productName,
          quantity: item.quantity,
          totalProductCost: item.totalProductCost,
          otherCost: item.otherCost,
          calculatedSourcingPrice: item.calculatedSourcingPrice,
        });

        const savedItem = await queryRunner.manager.save(purchaseItem);
        purchaseItems.push(savedItem);
      }

      if (dueAmount > 0) {
        await this.ledgerService.createLedgerEntry({
          entityType: 'supplier',
          entityId: payload.supplierId,
          type: 'due',
          amount: dueAmount,
          referenceId: savedPurchase.id,
          referenceType: 'purchase',
          description: `Purchase from supplier - Due amount`,
          transactionDate: new Date(),
        });
      }

      await commitTransaction(queryRunner);

      return await this.findOne({
        where: { id: savedPurchase.id },
        relations: { items: { product: true, variant: true }, supplier: true, purchasedBy: true },
      });
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Purchase not created');
    }
  }

  async updatePurchase(id: string, payload: UpdatePurchaseDTO): Promise<Purchase> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }
}
