import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { PURCHASE_DETAIL_RELATIONS } from '@src/app/helpers/transaction-details.helper';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { DataSource, EntityManager, FindOptionsRelations, Repository } from 'typeorm';
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
import { SuccessResponse } from '@src/app/types';

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
        if (
          combinations.some(
            (combination) =>
              !Number.isFinite(Number(combination.quantity)) || Number(combination.quantity) <= 0,
          )
        ) {
          throw new BadRequestException('Combination quantity must be greater than zero');
        }
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
            where: { id: item.productId, isDeleted: false },
          });
          if (!existingProduct) {
            throw new BadRequestException('Product not found');
          }

          // Update unit if provided
          if (item.unit) {
            await queryRunner.manager.update(Product, { id: item.productId }, { unit: item.unit });
          }

          if (combinations.length) {
            let weightedSourcingCost = 0;
            for (const combination of combinations) {
              if (!combination.quantity || combination.quantity <= 0) {
                throw new BadRequestException('Combination quantity must be greater than zero');
              }
              const combinationSourcingPrice =
                (combination.totalProductCost + (combination.otherCost ?? 0)) /
                combination.quantity;
              weightedSourcingCost += combinationSourcingPrice * combination.quantity;

              if (combination.skuId) {
                const sku = await queryRunner.manager.findOne(ProductVariantSku, {
                  where: { id: combination.skuId, productId, isDeleted: false },
                });
                if (!sku) throw new BadRequestException('SKU not found for the given product');
                await queryRunner.manager.update(
                  ProductVariantSku,
                  { id: sku.id, isDeleted: false },
                  {
                    stockQuantity: (sku.stockQuantity || 0) + combination.quantity,
                    sourcingPrice: combinationSourcingPrice,
                  },
                );
              } else if (combination.variantId) {
                const variant = await queryRunner.manager.findOne(ProductVariantOption, {
                  where: { id: combination.variantId, productId, isDeleted: false },
                });
                if (!variant) {
                  throw new BadRequestException('Variant not found for the given product');
                }
                await queryRunner.manager.update(
                  ProductVariantOption,
                  { id: variant.id, isDeleted: false },
                  { stockQuantity: (variant.stockQuantity || 0) + combination.quantity },
                );
              } else {
                throw new BadRequestException('A SKU or variant is required for each combination');
              }
            }

            const currentStock = existingProduct.stock || 0;
            const updatedStock = currentStock + itemQuantity;
            const updatedSourcingPrice = updatedStock > 0
              ? ((existingProduct.sourcingPrice || 0) * currentStock + weightedSourcingCost) /
                updatedStock
              : weightedSourcingCost / itemQuantity;
            await queryRunner.manager.update(
              Product,
              { id: productId, isDeleted: false },
              { stock: updatedStock, sourcingPrice: updatedSourcingPrice },
            );
          } else if (item.skuId) {
            // Legacy single-combination payloads remain supported.
            const sku = await queryRunner.manager.findOne(ProductVariantSku, {
              where: { id: item.skuId, productId, isDeleted: false },
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
              where: { id: item.variantId, productId, isDeleted: false },
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

          if (!combinations.length && !item.skuId) {
            await this.productService.updateSourcingPrice(item.productId, calculatedSourcingPrice);
          }
          if (!combinations.length) {
            await this.productService.updateStock(item.productId, item.quantity);
          }
        } else {
          const productCode = item.productCode?.trim();
          if (!productCode) {
            throw new BadRequestException(
              `Product code is required to create the new product: ${item.productName}`,
            );
          }
          const existingProduct = await this.productService.findOneIncludingDeleted({
            where: { productCode },
          });
          if (existingProduct && !existingProduct.isDeleted && !existingProduct.deletedAt) {
            throw new BadRequestException(`Product code already exists: ${productCode}`);
          }

          const detailedStock = combinations.length
            ? itemQuantity
            : item.skus?.length
              ? item.skus.reduce((sum, sku) => sum + (sku.stockQuantity || 0), 0)
              : item.variants?.length
                ? item.variants.reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0)
                : itemQuantity;
          const productData = ProductFactory.createProduct(
            productCode,
            item.productName,
            calculatedSourcingPrice,
            calculatedSourcingPrice,
            detailedStock,
            item.unit,
          );
          const createdProduct = await queryRunner.manager.save(
            Product,
            existingProduct
              ? {
                  ...existingProduct,
                  ...productData,
                  stock: (existingProduct.stock || 0) + detailedStock,
                  isDeleted: false,
                  deletedAt: null,
                }
              : productData,
          );
          productId = createdProduct.id;

          if (item.variants?.length) {
            for (const variant of item.variants) {
              const existingVariant = await queryRunner.manager.findOne(ProductVariantOption, {
                where: {
                  productId,
                  variantId: variant.variantId,
                  variantOptionId: variant.variantOptionId,
                },
                withDeleted: true,
              });
              await queryRunner.manager.save(ProductVariantOption, {
                ...existingVariant,
                ...variant,
                productId,
                sellingPrice: variant.sellingPrice ?? calculatedSourcingPrice,
                stockQuantity:
                  (existingVariant?.stockQuantity || 0) + (variant.stockQuantity || 0),
                isDeleted: false,
                deletedAt: null,
              });
            }
          }

          if (item.skus?.length) {
            for (const sku of item.skus) {
              const { values, ...skuData } = sku;
              await this.upsertPurchasedSku(queryRunner.manager, productId, skuData, values);
            }
          }

          if (combinations.length) {
            for (const combination of combinations) {
              if (!combination.productCode?.trim()) {
                throw new BadRequestException('SKU code is required for each new product combination');
              }
              const combinationSourcingPrice =
                (combination.totalProductCost + (combination.otherCost ?? 0)) /
                combination.quantity;
              const savedSku = await this.upsertPurchasedSku(queryRunner.manager, productId, {
                productCode: combination.productCode.trim(),
                sourcingPrice: combinationSourcingPrice,
                sellingPrice: combinationSourcingPrice,
                stockQuantity: combination.quantity,
              }, combination.values ?? []);
              combination.skuId = savedSku.id;
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
        const combinations = item.combinations ?? [];
        const purchaseLines = combinations.length
          ? combinations.map((combination) => ({
              variantId: combination.variantId ?? null,
              skuId: combination.skuId ?? null,
              productName: combination.name ?? item.productName,
              quantity: combination.quantity,
              totalProductCost: combination.totalProductCost,
              otherCost: combination.otherCost ?? 0,
              calculatedSourcingPrice:
                (combination.totalProductCost + (combination.otherCost ?? 0)) /
                combination.quantity,
            }))
          : [
              {
                variantId: item.variantId ?? null,
                skuId: item.skuId ?? null,
                productName: item.productName,
                quantity: item.quantity,
                totalProductCost: item.totalProductCost,
                otherCost: item.otherCost,
                calculatedSourcingPrice: item.calculatedSourcingPrice,
              },
            ];

        for (const line of purchaseLines) {
          const purchaseItem = queryRunner.manager.create(PurchaseItem, {
            purchaseId: savedPurchase.id,
            productId: item.productId,
            ...line,
          });
          purchaseItems.push(await queryRunner.manager.save(purchaseItem));
        }
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

  async deleteOneBase(id: string): Promise<SuccessResponse> {
    const purchase = await this.findOne({ where: { id: id as any } });
    if (!purchase) throw new NotFoundException('Purchase not found');

    const queryRunner = await startTransaction(this.dataSource);
    try {
      const deletedAt = new Date();
      await queryRunner.manager.update(
        Purchase,
        { id, isDeleted: false },
        { isDeleted: true, deletedAt },
      );
      await queryRunner.manager.update(
        Ledger,
        { referenceId: id, referenceType: 'purchase', isDeleted: false },
        { isDeleted: true, deletedAt },
      );
      await commitTransaction(queryRunner);
      return new SuccessResponse('Purchase soft-deleted successfully', null);
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Purchase not deleted');
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

  private async upsertPurchasedSku(
    manager: EntityManager,
    productId: string,
    skuData: Pick<ProductVariantSku, 'productCode' | 'sourcingPrice' | 'sellingPrice' | 'stockQuantity'>,
    values: Array<Pick<ProductVariantSkuValue, 'variantId' | 'variantOptionId'>>,
  ): Promise<ProductVariantSku> {
    const productCode = skuData.productCode?.trim();
    if (!productCode) throw new BadRequestException('SKU code is required');

    const existing = await manager.findOne(ProductVariantSku, {
      where: { productCode },
      withDeleted: true,
    });
    if (existing && existing.productId !== productId) {
      throw new BadRequestException(`SKU code already exists: ${productCode}`);
    }

    const savedSku = await manager.save(ProductVariantSku, {
      ...existing,
      ...skuData,
      productCode,
      productId,
      stockQuantity: (existing?.stockQuantity || 0) + (skuData.stockQuantity || 0),
      isDeleted: false,
      deletedAt: null,
    });

    const currentValues = await manager.find(ProductVariantSkuValue, {
      where: { skuId: savedSku.id },
      withDeleted: true,
    });
    for (const current of currentValues) {
      if (!values.some((value) => value.variantOptionId === current.variantOptionId)) {
        await manager.update(
          ProductVariantSkuValue,
          { id: current.id },
          { isDeleted: true, deletedAt: new Date() },
        );
      }
    }

    for (const [position, value] of values.entries()) {
      const existingValue = currentValues.find(
        (current) => current.variantOptionId === value.variantOptionId,
      );
      await manager.save(ProductVariantSkuValue, {
        ...existingValue,
        ...value,
        position,
        skuId: savedSku.id,
        isDeleted: false,
        deletedAt: null,
      });
    }

    return savedSku;
  }
}
