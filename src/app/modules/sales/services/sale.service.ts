import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { SALE_DETAIL_RELATIONS } from '@src/app/helpers/transaction-details.helper';
import { SuccessResponse } from '@src/app/types';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import {
  Between,
  DataSource,
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ENUM_CUSTOMER_TYPES } from '@src/shared';
import { SaleItemDTO } from '../dtos/sale-item.dto';
import { CreateSaleDTO } from '../dtos/create.dto';
import { UpdateSaleDTO } from '../dtos/update.dto';
import { FilterSaleDTO } from '../dtos/filter.dto';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantOption } from '../../product/entities/productVariantOption.entity';
import { ProductService } from '../../product/services/product.service';
import { ProductVariantOptionService } from '../../product/services/productVariantOption.service';
import { LedgerService } from '../../ledger/services/ledger.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class SaleService extends BaseService<Sale> {
  constructor(
    @InjectRepository(Sale)
    private readonly _repo: Repository<Sale>,
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
    private readonly productVariantOptionService: ProductVariantOptionService,
    private readonly ledgerService: LedgerService,
    private readonly invoiceService: InvoiceService,
  ) {
    super(_repo);
  }

  public readonly RELATIONS: FindOptionsRelations<Sale> = SALE_DETAIL_RELATIONS;

  async createSale(payload: CreateSaleDTO): Promise<Sale> {
    const queryRunner = await startTransaction(this.dataSource);

    try {
      const { items, discount, paidAmount, shippingTo, shippingAddress, shippingContact, ...restPayload } = payload;

      // Customer type (B2B / B2C) drives the per-product average selling price.
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: payload.customerId },
      });
      const customerType: ENUM_CUSTOMER_TYPES =
        customer?.customerType === ENUM_CUSTOMER_TYPES.B2B
          ? ENUM_CUSTOMER_TYPES.B2B
          : ENUM_CUSTOMER_TYPES.B2C;

      // Combine shipping fields into shippingAddress object
      const finalShippingAddress = {
        name: shippingTo || customer?.companyName || customer?.name || '',
        contactNumber: shippingContact || customer?.contactNumber || '',
        address: shippingAddress || customer?.address || '',
      };

      let totalAmount = 0;
      const resolvedItems: Array<{
        item: SaleItemDTO;
        unitPrice: number;
        unitCost: number;
        itemTotalAmount: number;
      }> = [];

      for (const item of items) {
        const { unitPrice, unitCost, itemTotalAmount } = await this.resolveSaleItem(
          item,
          queryRunner.manager,
        );
        totalAmount += itemTotalAmount;
        resolvedItems.push({ item, unitPrice, unitCost, itemTotalAmount });
      }

      const grandTotal = totalAmount - (discount || 0);
      const dueAmount = grandTotal - paidAmount;

      // Next sequential invoice number (e.g. INV-0001), race-safe via the PG
      // sequence created in the AddInvoiceToSales migration.
      const seqResult = await queryRunner.manager.query(
        `SELECT nextval('sales_invoice_seq') AS "seq"`,
      );
      const invoiceNo = `INV-${String(seqResult?.[0]?.seq || 0).padStart(4, '0')}`;

      // Save the sale first so the items can reference its id.
      const sale = queryRunner.manager.create(Sale, {
        ...restPayload,
        invoiceNo,
        totalAmount,
        discount: discount || 0,
        grandTotal,
        paidAmount,
        dueAmount,
        shippingTo: finalShippingAddress.name,
        shippingAddress: finalShippingAddress.address,
        shippingContact: finalShippingAddress.contactNumber,
      });

      const savedSale = await queryRunner.manager.save(sale);

      // Now insert the items with the real saleId.
      const saleItems: SaleItem[] = [];

      for (const { item, unitPrice, unitCost, itemTotalAmount } of resolvedItems) {
        const saleItem = queryRunner.manager.create(SaleItem, {
          saleId: savedSale.id,
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          sellingPrice: unitPrice,
          sourcingPrice: unitCost,
          totalAmount: itemTotalAmount,
        });

        const savedItem = await queryRunner.manager.save(saleItem);
        saleItems.push(savedItem);
      }

      // Keep the per-product B2B / B2C average selling price up to date.
      for (const { item, unitPrice } of resolvedItems) {
        await this.updateProductAverageSalesPrice(
          queryRunner.manager,
          item.productId,
          customerType,
          unitPrice,
          item.quantity,
        );
      }

      if (dueAmount > 0) {
        await this.ledgerService.createLedgerEntry({
          entityType: 'customer',
          entityId: payload.customerId,
          type: 'due',
          amount: grandTotal,
          referenceId: savedSale.id,
          referenceType: 'sale',
          description: `Sale to customer - Due amount`,
          transactionDate: payload.date,
        });
      }

      if (paidAmount > 0) {
        await this.ledgerService.createLedgerEntry({
          entityType: 'customer',
          entityId: payload.customerId,
          type: 'paid',
          amount: paidAmount,
          referenceId: savedSale.id,
          referenceType: 'sale',
          description: 'Payment received at time of sale',
          transactionDate: payload.date,
        });
      }

      await commitTransaction(queryRunner);

      // Generate and store the invoice PDF on Cloudflare R2.
      // The sale is already committed, so invoice generation failure does not
      // roll back the sale — but we must still surface the error so it is not
      // silently ignored.
      try {
        await this.invoiceService.generateAndStoreInvoice(savedSale.id);
      } catch (invoiceError) {
        console.error('Invoice generation failed after sale commit, sale saved without invoiceUrl:', invoiceError);
        // Re-throw so the API caller knows the invoice is missing and can
        // retry via GET /internal/sales/:id/invoice.
        throw new Error(`Invoice generation failed: ${(invoiceError as Error).message}`);
      }

      return await this.findOne({
        where: { id: savedSale.id },
        relations: SALE_DETAIL_RELATIONS,
      });
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Sale not created');
    }
  }

  /**
   * Returns the invoice PDF for a sale, generated on demand from live data.
   * Used by GET /internal/sales/:id/invoice (and as a fallback when the
   * stored copy is missing).
   */
  async getInvoicePdf(id: string): Promise<Buffer> {
    const sale = await this.invoiceService.findSaleWithInvoiceData(id);
    if (!sale) {
      throw new NotFoundException(`Sale not found: ${id}`);
    }
    return await this.invoiceService.generateInvoicePdf(sale);
  }

  async updateSale(id: string, payload: UpdateSaleDTO): Promise<Sale> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }

  async findAllWithFilters(filters: FilterSaleDTO): Promise<SuccessResponse<Sale[]>> {
    const { customerId, startDate, endDate, page, limit } = filters;

    const where: FindOptionsWhere<Sale> = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
      if (start && end) {
        where.date = Between(start, end);
      } else if (start) {
        where.date = MoreThanOrEqual(start);
      } else if (end) {
        where.date = LessThanOrEqual(end);
      }
    }

    const [data, total] = await this._repo.findAndCount({
      where,
      relations: SALE_DETAIL_RELATIONS,
      skip: page && limit ? (page - 1) * limit : undefined,
      take: limit,
    });

    return new SuccessResponse<Sale[]>('Sales fetched successfully', data, {
      total,
      page: page || 1,
      limit: limit || 10,
    });
  }

  /**
   * Resolves the unit price and stock for a single sale item.
   *
   * - The unit price is always the sellingPrice passed by the user for this
   *   sale; a product can be sold at any price regardless of its configured
   *   selling price.
   * - When a variant (ProductVariantOption) is provided, its own stock is
   *   consumed (product level stock is reduced as well since it mirrors the
   *   sum of its variant stocks).
   * - Otherwise the product's own stock is consumed.
   */
  private async resolveSaleItem(
    item: SaleItemDTO,
    manager: EntityManager,
  ): Promise<{ unitPrice: number; unitCost: number; itemTotalAmount: number }> {
    const product = await this.productService.isExist({ id: item.productId as any });

    // Unit cost snapshot = the product's sourcing price at the time of sale.
    // Variant purchases keep sourcing price at product level, so the same cost
    // applies whether or not a variant is selected.
    const unitCost = product.sourcingPrice || 0;

    if (item.variantId) {
      const variant = await this.productVariantOptionService.findOne({
        where: { id: item.variantId, productId: product.id },
      });
      if (!variant) {
        throw new NotFoundException(`Variant not found for product: ${product.title}`);
      }

      const availableStock = variant.stockQuantity || 0;
      if (availableStock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product variant: ${product.title}`);
      }

      const unitPrice = item.sellingPrice;
      if (!unitPrice || unitPrice < 0) {
        throw new BadRequestException(`Invalid selling price for product: ${product.title}`);
      }

      // Consume variant level stock and track sold quantity
      await manager.update(
        ProductVariantOption,
        { id: variant.id },
        {
          stockQuantity: availableStock - item.quantity,
          saleQuantity: (variant.saleQuantity || 0) + item.quantity,
        },
      );

      // Keep product level stock in sync (it equals the sum of variant stocks)
      await manager.update(
        Product,
        { id: product.id },
        {
          stock: Math.max(0, (product.stock || 0) - item.quantity),
          saleQuantity: (product.saleQuantity || 0) + item.quantity,
        },
      );

      return { unitPrice, unitCost, itemTotalAmount: unitPrice * item.quantity };
    }

    const availableStock = product.stock || 0;
    if (availableStock < item.quantity) {
      throw new BadRequestException(`Insufficient stock for product: ${product.title}`);
    }

    const unitPrice = item.sellingPrice;
    if (!unitPrice || unitPrice < 0) {
      throw new BadRequestException(`Invalid selling price for product: ${product.title}`);
    }

    // Consume product level stock and track sold quantity
    await manager.update(
      Product,
      { id: product.id },
      {
        stock: availableStock - item.quantity,
        saleQuantity: (product.saleQuantity || 0) + item.quantity,
      },
    );

    return { unitPrice, unitCost, itemTotalAmount: unitPrice * item.quantity };
  }

  /**
   * Updates a product's weighted average selling price for the sale's customer
   * type (B2B / B2C). The quantity sold is used as the weight so the average
   * reflects how many units were actually sold at each price.
   */
  private async updateProductAverageSalesPrice(
    manager: EntityManager,
    productId: string,
    customerType: ENUM_CUSTOMER_TYPES,
    unitPrice: number,
    quantity: number,
  ): Promise<void> {
    const product = await manager.findOne(Product, { where: { id: productId } });
    if (!product) {
      return;
    }

    const isB2B = customerType === ENUM_CUSTOMER_TYPES.B2B;
    const qtyField: 'b2bSoldQuantity' | 'b2cSoldQuantity' = isB2B
      ? 'b2bSoldQuantity'
      : 'b2cSoldQuantity';
    const avgField: 'averageB2BSalesPrice' | 'averageB2CSalesPrice' = isB2B
      ? 'averageB2BSalesPrice'
      : 'averageB2CSalesPrice';

    const oldQty = product[qtyField] || 0;
    const oldAvg = product[avgField] || 0;
    const newQty = oldQty + quantity;
    const newAvg = newQty > 0 ? (oldAvg * oldQty + unitPrice * quantity) / newQty : unitPrice;

    await manager.update(
      Product,
      { id: productId },
      {
        [qtyField]: newQty,
        [avgField]: Math.round(newAvg * 100) / 100,
      },
    );
  }
}
