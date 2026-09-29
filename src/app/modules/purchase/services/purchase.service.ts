import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { PURCHASE_DETAIL_RELATIONS } from '@src/app/helpers/transaction-details.helper';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';
import { CreatePurchaseDTO } from '../dtos/create.dto';
import { UpdatePurchaseDTO } from '../dtos/update.dto';
import { PurchaseItemDTO } from '../dtos/purchase-item.dto';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { ProductFactory } from '../factories/product.factory';
import { Product } from '../../product/entities/product.entity';
import { ProductService } from '../../product/services/product.service';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';
import { ProductVariantSku } from '../../product/entities/productVariantSku.entity';
import { ProductVariantSkuValue } from '../../product/entities/productVariantSkuValue.entity';
import { LedgerService } from '../../ledger/services/ledger.service';
import { Ledger } from '../../ledger/entities/ledger.entity';

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

  public readonly RELATIONS: FindOptionsRelations<Purchase> = PURCHASE_DETAIL_RELATIONS;

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
        const combinations = item.combinations ?? [];
        const itemQuantity = combinations.length
          ? combinations.reduce((sum, combination) => sum + combination.quantity, 0)
          : item.quantity;
        const itemTotalProductCost = combinations.length
          ? combinations.reduce((sum, combination) => sum + combination.totalProductCost, 0)
          : item.totalProductCost;
        const itemOtherCost = combinations.length
          ? combinations.reduce((sum, combination) => sum + (combination.otherCost ?? 0), 0)
          : item.otherCost;
        const calculatedSourcingPrice = (itemTotalProductCost + itemOtherCost) / itemQuantity;

        let productId: string;

        if (item.productId) {
          productId = item.productId;
          const existingProduct = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
          });
          if (!existingProduct) {
            throw new BadRequestException('Product not found');
          }

          // Update unit if provided
          if (item.unit) {
            await queryRunner.manager.update(Product, { id: item.productId }, { unit: item.unit });
          }

          // Variant purchase: add stock to the specific variant option and
          // keep the product-level stock in sync (it mirrors the sum of the
          // variant stocks). Sourcing price is still a product-level figure.
          if (item.skuId) {
            const sku = await queryRunner.manager.findOne(ProductVariantSku, {
              where: { id: item.skuId, productId },
            });
            if (!sku) throw new BadRequestException('SKU not found for the given product');
            await queryRunner.manager.update(
              ProductVariantSku,
              { id: sku.id },
              {
                stockQuantity: (sku.stockQuantity || 0) + item.quantity,
                sourcingPrice: calculatedSourcingPrice,
              },
            );
          } else if (item.variantId) {
            const variant = await queryRunner.manager.findOne(ProductVariantOption, {
              where: { id: item.variantId, productId },
            });
            if (!variant) {
              throw new BadRequestException('Variant not found for the given product');
            }
            await queryRunner.manager.update(
              ProductVariantOption,
              { id: variant.id },
              { stockQuantity: (variant.stockQuantity || 0) + item.quantity },
            );
          }

          if (!item.skuId) {
            await this.productService.updateSourcingPrice(item.productId, calculatedSourcingPrice);
          }
          await this.productService.updateStock(item.productId, item.quantity);
        } else {
          const productCode = item.productCode?.trim();
          if (!productCode) {
            throw new BadRequestException(
              `Product code is required to create the new product: ${item.productName}`,
            );
          }
          await this.productService.assertUniqueProductCode(productCode);

          const detailedStock = combinations.length
            ? itemQuantity
            : item.skus?.length
              ? item.skus.reduce((sum, sku) => sum + (sku.stockQuantity || 0), 0)
              : item.variants?.length
                ? item.variants.reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0)
                : itemQuantity;
          const newProduct = ProductFactory.createProduct(
            productCode,
            item.productName,
            calculatedSourcingPrice,
            calculatedSourcingPrice,
            detailedStock,
            item.unit,
          );
          const createdProduct = await queryRunner.manager.save(newProduct);
          productId = createdProduct.id;

          if (item.variants?.length) {
            await queryRunner.manager.save(
              ProductVariantOption,
              item.variants.map((variant) => ({
                ...variant,
                productId,
                sellingPrice: variant.sellingPrice ?? calculatedSourcingPrice,
              })),
            );
          }

          if (item.skus?.length) {
            for (const sku of item.skus) {
              const { values, ...skuData } = sku;
              const savedSku = await queryRunner.manager.save(ProductVariantSku, {
                ...skuData,
                productId,
              });
              await queryRunner.manager.save(
                ProductVariantSkuValue,
                values.map((value) => ({ ...value, skuId: savedSku.id })),
              );
            }
          }

          if (combinations.length) {
            for (const combination of combinations) {
              const combinationSourcingPrice =
                (combination.totalProductCost + (combination.otherCost ?? 0)) /
                combination.quantity;
              await this.productService.assertUniqueSkuCode(combination.productCode.trim());

              const savedSku = await queryRunner.manager.save(ProductVariantSku, {
                productCode: combination.productCode.trim(),
                sourcingPrice: combinationSourcingPrice,
                sellingPrice: combinationSourcingPrice,
                stockQuantity: combination.quantity,
                productId,
              });
              await queryRunner.manager.save(
                ProductVariantSkuValue,
                combination.values.map((value, position) => ({
                  ...value,
                  position,
                  skuId: savedSku.id,
                })),
              );
            }
          }
        }

        totalQuantity += itemQuantity;
        totalPurchaseAmount += itemTotalProductCost + itemOtherCost;

        resolvedItems.push({
          ...item,
          quantity: itemQuantity,
          totalProductCost: itemTotalProductCost,
          otherCost: itemOtherCost,
          productId,
          calculatedSourcingPrice,
        });
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
          skuId: item.skuId ?? null,
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
          amount: totalPurchaseAmount,
          referenceId: savedPurchase.id,
          referenceType: 'purchase',
          description: `Purchase from supplier - Due amount`,
          transactionDate: payload.purchaseDate,
        });
      }

      if (paidAmount > 0) {
        await this.ledgerService.createLedgerEntry({
          entityType: 'supplier',
          entityId: payload.supplierId,
          type: 'paid',
          amount: paidAmount,
          referenceId: savedPurchase.id,
          referenceType: 'purchase',
          description: 'Payment made at time of purchase',
          transactionDate: payload.purchaseDate,
        });
      }

      await commitTransaction(queryRunner);

      return await this.findOne({
        where: { id: savedPurchase.id },
        relations: PURCHASE_DETAIL_RELATIONS,
      });
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Purchase not created');
    }
  }

  async updatePurchase(id: string, payload: UpdatePurchaseDTO): Promise<Purchase> {
    const existingPurchase = await this.findOne({
      where: { id: id as any },
      relations: ['items'],
    });

    if (!existingPurchase) {
      throw new NotFoundException('Purchase not found');
    }

    const queryRunner = await startTransaction(this.dataSource);

    try {
      const { items, paidAmount, ...restPayload } = payload;
      let newTotalPurchaseAmount = existingPurchase.totalPurchaseAmount;
      let newTotalQuantity = existingPurchase.totalQuantity;
      let newPaidAmount = existingPurchase.paidAmount;
      let newDueAmount = existingPurchase.dueAmount;
      const ledgerDate = restPayload.purchaseDate ?? existingPurchase.purchaseDate;

      // Recalculate totals if items are provided
      if (items && items.length > 0) {
        let totalPurchaseAmount = 0;
        let totalQuantity = 0;
        for (const item of items) {
          totalPurchaseAmount += item.totalProductCost + item.otherCost;
          totalQuantity += item.quantity;
        }
        newTotalPurchaseAmount = totalPurchaseAmount;
        newTotalQuantity = totalQuantity;
        newPaidAmount = paidAmount ?? existingPurchase.paidAmount;
        newDueAmount = newTotalPurchaseAmount - newPaidAmount;
      } else if (paidAmount !== undefined) {
        newPaidAmount = paidAmount;
        newDueAmount = existingPurchase.totalPurchaseAmount - paidAmount;
      }

      // Update the purchase
      const updateData: any = { ...restPayload };
      if (items && items.length > 0) {
        updateData.totalPurchaseAmount = newTotalPurchaseAmount;
        updateData.totalQuantity = newTotalQuantity;
        updateData.paidAmount = newPaidAmount;
        updateData.dueAmount = newDueAmount;
      } else if (paidAmount !== undefined) {
        updateData.paidAmount = newPaidAmount;
        updateData.dueAmount = newDueAmount;
      }

      await queryRunner.manager.update(Purchase, { id }, updateData);

      // Reconcile the ledger with the purchase's final state. This runs on
      // every update - not just when an amount changed - so an entry that
      // already drifted out of sync on an earlier edit is repaired, not
      // preserved.
      const existingLedgerEntries = await queryRunner.manager.find(Ledger, {
        where: {
          referenceId: id,
          referenceType: 'purchase',
          isDeleted: false,
        },
      });

      const dueEntry = existingLedgerEntries.find((e) => e.type === 'due');
      const paidEntry = existingLedgerEntries.find((e) => e.type === 'paid');

      // Payments recorded separately against this purchase already exist as
      // their own ledger entries (referenceType 'payment') and are rolled into
      // the purchase's paidAmount, so subtract them: the purchase's own 'paid'
      // entry only carries what was paid at the time of purchase. Otherwise the
      // same money is debited twice.
      const linkedPayments = await queryRunner.manager.find(Payment, {
        where: { referenceId: id, referenceType: 'purchase', isDeleted: false },
      });
      const separatelyPaidTotal = linkedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const atPurchasePaidAmount = newPaidAmount - separatelyPaidTotal;

      const ledgerParty = {
        entityType: 'supplier',
        entityId: payload.supplierId ?? existingPurchase.supplierId,
      };

      // The 'due' entry is the invoice credit, so it always carries the full
      // (gross) invoice amount - only the balance (due - paid) says what we
      // still owe. It is kept once it exists: deleting it when separate
      // payments settle the purchase would unbalance the debits.
      await this.ledgerService.reconcileLedgerEntry(
        queryRunner.manager,
        dueEntry,
        Boolean(dueEntry) || newDueAmount > 0,
        {
          ...ledgerParty,
          type: 'due',
          amount: newTotalPurchaseAmount,
          referenceId: id,
          referenceType: 'purchase',
          description: `Purchase from supplier - Due amount`,
          transactionDate: ledgerDate,
        },
      );

      await this.ledgerService.reconcileLedgerEntry(
        queryRunner.manager,
        paidEntry,
        atPurchasePaidAmount > 0,
        {
          ...ledgerParty,
          type: 'paid',
          amount: atPurchasePaidAmount,
          referenceId: id,
          referenceType: 'purchase',
          description: 'Payment made at time of purchase',
          transactionDate: ledgerDate,
        },
      );

      await commitTransaction(queryRunner);

      return await this.findOne({
        where: { id },
        relations: PURCHASE_DETAIL_RELATIONS,
      });
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Purchase not updated');
    }
  }
}
