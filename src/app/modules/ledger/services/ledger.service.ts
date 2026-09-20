import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { SuccessResponse } from '@src/app/types';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { loadPurchases, loadSales } from '@src/app/helpers/transaction-details.helper';
import { CreateLedgerDTO, UpdateLedgerDTO, FilterLedgerDTO } from '../dtos/ledger.dto';
import { Ledger } from '../entities/ledger.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Injectable()
export class LedgerService extends BaseService<Ledger> {
  constructor(
    @InjectRepository(Ledger)
    private readonly _repo: Repository<Ledger>,
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
  ) {
    super(_repo);
  }

  async createLedgerEntry(payload: CreateLedgerDTO): Promise<Ledger> {
    return this.createOneBase(payload as any);
  }

  async updateLedger(id: string, payload: UpdateLedgerDTO): Promise<Ledger> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }

  async findAllWithFilters(filters: FilterLedgerDTO): Promise<SuccessResponse<Ledger[]>> {
    const { entityType, entityId, type, startDate, endDate, page, limit } = filters;

    const where: FindOptionsWhere<Ledger> = {};

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
      if (start && end) {
        where.transactionDate = Between(start, end);
      } else if (start) {
        where.transactionDate = MoreThanOrEqual(start);
      } else if (end) {
        where.transactionDate = LessThanOrEqual(end);
      }
    }

    const [data, total] = await this._repo.findAndCount({
      where,
      order: { transactionDate: 'DESC' },
      skip: page && limit ? (page - 1) * limit : undefined,
      take: limit,
    });

    return new SuccessResponse<Ledger[]>('Ledger entries fetched successfully', data, {
      total,
      page: page || 1,
      limit: limit || 10,
    });
  }

  async getCustomerBalance(
    customerId: string,
  ): Promise<{ totalDue: number; totalPaid: number; balance: number }> {
    const entries = await this.find({
      where: { entityType: 'customer', entityId: customerId },
    });

    let totalDue = 0;
    let totalPaid = 0;

    entries.forEach((entry) => {
      if (entry.type === 'due') {
        totalDue += entry.amount;
      } else if (entry.type === 'paid') {
        totalPaid += entry.amount;
      }
    });

    // For customers: negative balance = they owe us, positive = we owe them
    // Balance = credit (paid) - debit (due)
    return {
      totalDue,
      totalPaid,
      balance: totalPaid - totalDue,
    };
  }

  async getSupplierBalance(
    supplierId: string,
  ): Promise<{ totalDue: number; totalPaid: number; balance: number }> {
    const entries = await this.find({
      where: { entityType: 'supplier', entityId: supplierId },
    });

    let totalDue = 0;
    let totalPaid = 0;

    entries.forEach((entry) => {
      if (entry.type === 'due') {
        totalDue += entry.amount;
      } else if (entry.type === 'paid') {
        totalPaid += entry.amount;
      }
    });

    // For suppliers: positive balance = we owe them, negative = they owe us
    // Balance = credit (due) - debit (paid) = what we owe them
    return {
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
    };
  }

  async getStatement(query: {
    entityType: 'customer' | 'supplier';
    entityId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { entityType, entityId, startDate, endDate } = query;

    // 1. Load the party (customer or supplier) — 404 if not found.
    const party =
      entityType === 'customer'
        ? await this.customerRepo.findOne({ where: { id: entityId } })
        : await this.supplierRepo.findOne({ where: { id: entityId } });

    if (!party) {
      throw new NotFoundException(
        `${entityType === 'customer' ? 'Customer' : 'Supplier'} not found: ${entityId}`,
      );
    }

    // 2. Compute opening balance from entries before startDate (if given).
    let openingBalance = 0;
    if (startDate) {
      const openingEntries = await this._repo.find({
        where: {
          entityType,
          entityId,
          transactionDate: LessThan(new Date(startDate)),
        },
        select: ['type', 'amount'],
      });

      openingEntries.forEach((entry) => {
        // For customers: negative balance = they owe us, positive = we owe them
        // For suppliers: positive balance = we owe them, negative = they owe us
        if (entityType === 'customer') {
          if (entry.type === 'due') {
            openingBalance -= entry.amount; // They owe us more (debit)
          } else if (entry.type === 'paid') {
            openingBalance += entry.amount; // They paid us (credit)
          }
        } else {
          if (entry.type === 'due') {
            openingBalance += entry.amount; // We owe them more (credit)
          } else if (entry.type === 'paid') {
            openingBalance -= entry.amount; // We paid them (debit)
          }
        }
      });
    }

    // 3. Query statement entries within the requested range.
    const where: FindOptionsWhere<Ledger> = {
      entityType,
      entityId,
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.transactionDate = Between(start, end);
    } else if (startDate) {
      where.transactionDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.transactionDate = LessThanOrEqual(end);
    }

    const entries = await this._repo.find({
      where,
      order: {
        transactionDate: 'ASC',
        createdAt: 'ASC',
      },
    });

    // 4. Bulk-resolve references to avoid N+1.
    const saleIds = new Set<string>();
    const purchaseIds = new Set<string>();
    const paymentIds = new Set<string>();

    for (const entry of entries) {
      if (!entry.referenceId) continue;
      if (entry.referenceType === 'sale') {
        saleIds.add(entry.referenceId);
      } else if (entry.referenceType === 'purchase') {
        purchaseIds.add(entry.referenceId);
      } else if (entry.referenceType === 'payment') {
        paymentIds.add(entry.referenceId);
      }
    }

    const sales = await loadSales(Array.from(saleIds), this.saleRepo);
    const purchases = await loadPurchases(Array.from(purchaseIds), this.purchaseRepo);
    const payments = await this.paymentRepo.find({
      where: { id: In(Array.from(paymentIds)) },
    });
    const paymentMap = new Map<string, Payment>(payments.map((p) => [p.id, p]));

    // 5. Build statement rows - process each ledger entry individually
    const rows: Array<{
      date: string;
      particulars: string | null;
      narration: string;
      invoiceNo: string | null;
      qty: number | null;
      gross: number | null;
      debit: number;
      credit: number;
      balance: number;
    }> = [];

    let runningBalance = openingBalance;
    let grossTotal = 0;
    let debitTotal = 0;
    let creditTotal = 0;

    for (const entry of entries) {
      const isDue = entry.type === 'due';
      const isPaid = entry.type === 'paid';
      
      // For customers (receivables): due = debit, paid = credit
      // For suppliers (payables): due = credit, paid = debit
      let debit = 0;
      let credit = 0;
      
      if (entityType === 'customer') {
        debit = isDue ? entry.amount : 0;
        credit = isPaid ? entry.amount : 0;
      } else {
        credit = isDue ? entry.amount : 0;
        debit = isPaid ? entry.amount : 0;
      }

      // For customers: negative balance = they owe us, positive = we owe them
      // For suppliers: positive balance = we owe them, negative = they owe us
      // Balance = credit - debit
      runningBalance += credit - debit;

      const resolvedSale = entry.referenceType === 'sale' ? sales.get(entry.referenceId) : null;
      const resolvedPurchase =
        entry.referenceType === 'purchase' ? purchases.get(entry.referenceId) : null;
      const resolvedPayment =
        entry.referenceType === 'payment' ? paymentMap.get(entry.referenceId) : null;

      // invoiceNo
      const invoiceNo = (() => {
        if (resolvedSale?.invoiceNo) return resolvedSale.invoiceNo;
        if (resolvedPurchase && 'invoiceNo' in resolvedPurchase && resolvedPurchase.invoiceNo) {
          return resolvedPurchase.invoiceNo as string;
        }
        return null;
      })();

      // gross & qty only for due rows
      const gross: number | null = (() => {
        if (isDue) {
          if (resolvedSale) {
            return resolvedSale.grandTotal ?? null;
          } else if (resolvedPurchase) {
            return (resolvedPurchase as any).totalPurchaseAmount ?? null;
          }
        }
        return null;
      })();

      const qty: number | null = (() => {
        if (isDue) {
          if (resolvedSale) {
            return resolvedSale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || null;
          } else if (resolvedPurchase) {
            return (resolvedPurchase as any).items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || null;
          }
        }
        return null;
      })();

      // particulars: payment method
      const particulars: string | null = (() => {
        if (isDue) {
          if (resolvedSale?.paymentMethod) return resolvedSale.paymentMethod;
          if (resolvedPurchase && 'paymentMethod' in resolvedPurchase && resolvedPurchase.paymentMethod) {
            return (resolvedPurchase as any).paymentMethod;
          }
        } else {
          // paid row
          if (resolvedPayment?.paymentMethod) return resolvedPayment.paymentMethod;
          if (resolvedSale?.paymentMethod) return resolvedSale.paymentMethod;
          if (resolvedPurchase && 'paymentMethod' in resolvedPurchase && resolvedPurchase.paymentMethod) {
            return (resolvedPurchase as any).paymentMethod;
          }
        }
        return null;
      })();

      // narration
      const narration: string = (() => {
        if (isDue) {
          if (resolvedSale?.items?.length) {
            const parts = resolvedSale.items
              .filter((item) => item.quantity && item.quantity > 0)
              .map((item) => {
                const product = item.product;
                const variant = item.variant?.variantOption?.title
                  ? ` (${item.variant?.variantOption?.title})`
                  : '';
                return `${product?.title || 'Unknown'}${variant} - ${item.quantity}`;
              });
            return parts.join(', ');
          } else if (
            resolvedPurchase &&
            'items' in resolvedPurchase &&
            resolvedPurchase.items?.length
          ) {
            const parts = (resolvedPurchase as any).items
              .filter((item: any) => item.quantity && item.quantity > 0)
              .map((item: any) => {
                const product = item.product;
                const variant = item.variant?.variantOption?.title
                  ? ` (${item.variant?.variantOption?.title})`
                  : '';
                return `${product?.title || item.productName || 'Unknown'}${variant} - ${item.quantity}`;
              });
            return parts.join(', ');
          } else {
            return entry.description || '';
          }
        } else {
          // paid row
          const entityLabel = entityType === 'customer' ? 'Payment received' : 'Payment made';

          if (entry.referenceType === 'sale' || entry.referenceType === 'purchase') {
            const resolvedInvoiceNo =
              entry.referenceType === 'sale'
                ? resolvedSale?.invoiceNo
                : resolvedPurchase && 'invoiceNo' in resolvedPurchase
                  ? (resolvedPurchase as any).invoiceNo
                  : null;
            if (resolvedInvoiceNo) {
              return entityType === 'customer'
                ? `Payment received against ${resolvedInvoiceNo}`
                : `Payment made against ${resolvedInvoiceNo}`;
            } else {
              return entityLabel;
            }
          } else {
            // referenceType === 'payment' or null
            const note =
              resolvedPayment?.note ||
              (entry.description
                ? entry.description.replace(/^(Payment received|Payment made)[\s-]+/, '')
                : '');
            if (note) {
              return `${entityLabel} — ${note}`;
            } else {
              return entityLabel;
            }
          }
        }
      })();

      grossTotal += gross || 0;
      debitTotal += debit;
      creditTotal += credit;

      const dateStr = entry.transactionDate 
        ? new Date(entry.transactionDate).toISOString().split('T')[0] 
        : '';

      rows.push({
        date: dateStr,
        particulars,
        narration,
        invoiceNo,
        qty,
        gross,
        debit,
        credit,
        balance: runningBalance,
      });
    }

    const closingBalance = rows.length ? rows[rows.length - 1].balance : openingBalance;

    // Build the response payload matching the documented shape.
    const partyResponse = {
      id: party.id,
      name:
        (entityType === 'customer' ? (party as Customer).name : (party as Supplier).companyName) ||
        '',
      companyName:
        (entityType === 'customer' ? (party as Customer).companyName : (party as Supplier).companyName) ||
        null,
      contactNumber: party.contactNumber || null,
      address: party.address || null,
      ...(entityType === 'customer' ? { customerType: (party as Customer).customerType } : {}),
    };

    return {
      success: true,
      statusCode: 200,
      message: 'Statement fetched successfully',
      data: {
        party: partyResponse,
        startDate: startDate || null,
        endDate: endDate || null,
        openingBalance,
        closingBalance,
        totals: {
          grossTotal,
          debitTotal,
          creditTotal,
        },
        rows,
      },
    };
  }
}
