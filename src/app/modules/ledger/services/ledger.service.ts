import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { pruneSoftDeleted } from '@src/shared/utils/dborm.utils';
import { SuccessResponse } from '@src/app/types';
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  loadExpenses,
  loadPurchases,
  loadSales,
} from '@src/app/helpers/transaction-details.helper';
import { CreateLedgerDTO, UpdateLedgerDTO, FilterLedgerDTO } from '../dtos/ledger.dto';
import { Ledger } from '../entities/ledger.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { Employee } from '../../employee/entities/employee.entity';

export type LedgerEntityType = 'customer' | 'supplier' | 'employee';

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
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
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

  /**
   * Upserts (or removes) one ledger entry so it matches the desired state.
   *
   * Transaction services call this on every update - not only when an amount
   * changed - so the ledger is self-healing: an entry that drifted out of sync
   * on an earlier edit is corrected the next time the transaction is saved.
   */
  async reconcileLedgerEntry(
    manager: EntityManager,
    existing: Ledger | undefined,
    shouldExist: boolean,
    values: Partial<Ledger>,
  ): Promise<void> {
    if (!shouldExist) {
      if (existing) {
        // Soft-delete the ledger entry instead of hard-deleting it.
        // Ledger entries are transaction records, so they are never hard-deleted.
        await manager.update(
          Ledger,
          { id: existing.id },
          { isDeleted: true, deletedAt: new Date() },
        );
      }
      return;
    }

    if (existing) {
      await manager.update(Ledger, { id: existing.id }, {
        ...values,
        isDeleted: false,
        deletedAt: null,
      });
    } else {
      await manager.save(manager.create(Ledger, values));
    }
  }

  async findAllWithFilters(filters: FilterLedgerDTO): Promise<SuccessResponse<Ledger[]>> {
    const { entityType, entityId, type, startDate, endDate, page, limit } = filters;

    // Soft-deleted ledger entries are never listed.
    const where: FindOptionsWhere<Ledger> = { isDeleted: false, isActive: true };

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

    return new SuccessResponse<Ledger[]>(
      'Ledger entries fetched successfully',
      pruneSoftDeleted(data),
      {
        total,
        page: page || 1,
        limit: limit || 10,
      },
    );
  }

  async getCustomerBalance(
    customerId: string,
  ): Promise<{ totalDue: number; totalPaid: number; balance: number }> {
    // Soft-deleted ledger entries must not affect the balance.
    const entries = await this.find({
      where: { entityType: 'customer', entityId: customerId, isDeleted: false, isActive: true },
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
      where: { entityType: 'supplier', entityId: supplierId, isDeleted: false, isActive: true },
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

  /**
   * Employee balance = money spent - advances received.
   *
   * Advances are debited to the employee and expenses are credited, so a
   * negative balance means the employee still holds company money (they must
   * return it / account for it), while a positive balance means the company
   * owes the employee a reimbursement for out-of-pocket spending.
   */
  async getEmployeeBalance(
    employeeId: string,
  ): Promise<{ totalAdvance: number; totalExpense: number; balance: number }> {
    const entries = await this.find({
      where: { entityType: 'employee', entityId: employeeId, isDeleted: false, isActive: true },
    });

    let totalAdvance = 0;
    let totalExpense = 0;

    entries.forEach((entry) => {
      if (entry.type === 'advance') {
        totalAdvance += entry.amount;
      } else if (entry.type === 'expense') {
        totalExpense += entry.amount;
      }
    });

    return {
      totalAdvance,
      totalExpense,
      balance: totalExpense - totalAdvance,
    };
  }

  async getBalanceSummary(): Promise<{ customerDue: number; supplierDue: number }> {
    const entries = await this.find({
      where: [
        { entityType: 'customer', isDeleted: false },
        { entityType: 'supplier', isDeleted: false },
      ],
      select: ['entityType', 'type', 'amount'],
    });

    return entries.reduce(
      (summary, entry) => {
        const amount = Number(entry.amount || 0);
        if (entry.entityType === 'customer') {
          summary.customerDue +=
            entry.type === 'due' ? amount : entry.type === 'paid' ? -amount : 0;
        } else if (entry.entityType === 'supplier') {
          summary.supplierDue +=
            entry.type === 'due' ? amount : entry.type === 'paid' ? -amount : 0;
        }
        return summary;
      },
      { customerDue: 0, supplierDue: 0 },
    );
  }

  async getStatement(query: {
    entityType: LedgerEntityType;
    entityId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { entityType, entityId, startDate, endDate } = query;

    // 1. Load the party (customer / supplier / employee) — 404 if not found.
    const party =
      entityType === 'customer'
        ? await this.customerRepo.findOne({ where: { id: entityId, isDeleted: false } })
        : entityType === 'supplier'
          ? await this.supplierRepo.findOne({ where: { id: entityId, isDeleted: false } })
          : await this.employeeRepo.findOne({ where: { id: entityId, isDeleted: false } });

    if (!party) {
      throw new NotFoundException(`${entityType} not found: ${entityId}`);
    }

    // 2. Compute opening balance from entries before startDate (if given).
    let openingBalance = 0;
    if (startDate) {
      const openingEntries = await this._repo.find({
        where: {
          entityType,
          entityId,
          isDeleted: false,
          isActive: true,
          transactionDate: LessThan(new Date(startDate)),
        },
        select: ['type', 'amount'],
      });

      openingEntries.forEach((entry) => {
        // For customers: negative balance = they owe us, positive = we owe them
        // For suppliers: positive balance = we owe them, negative = they owe us
        // For employees: negative = employee owes us, positive = we owe them
        if (entityType === 'customer') {
          if (entry.type === 'due') {
            openingBalance -= entry.amount; // They owe us more (debit)
          } else if (entry.type === 'paid') {
            openingBalance += entry.amount; // They paid us (credit)
          }
        } else if (entityType === 'employee') {
          if (entry.type === 'advance') {
            openingBalance -= entry.amount; // Advance given (debit)
          } else if (entry.type === 'expense') {
            openingBalance += entry.amount; // Money spent (credit)
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
      isDeleted: false,
      isActive: true,
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
    const expenseIds = new Set<string>();

    for (const entry of entries) {
      if (!entry.referenceId) continue;
      if (entry.referenceType === 'sale') {
        saleIds.add(entry.referenceId);
      } else if (entry.referenceType === 'purchase') {
        purchaseIds.add(entry.referenceId);
      } else if (entry.referenceType === 'payment') {
        paymentIds.add(entry.referenceId);
      } else if (entry.referenceType === 'expense') {
        expenseIds.add(entry.referenceId);
      }
    }

    const sales = await loadSales(Array.from(saleIds), this.saleRepo);
    const purchases = await loadPurchases(Array.from(purchaseIds), this.purchaseRepo);
    const payments = await this.paymentRepo.find({
      where: { id: In(Array.from(paymentIds)), isDeleted: false },
    });
    const paymentMap = new Map<string, Payment>(payments.map((p) => [p.id, p]));
    const expenses = await loadExpenses(Array.from(expenseIds), this.expenseRepo);

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
      const isEmployee = entityType === 'employee';

      // For customers (receivables): due = debit, paid = credit
      // For suppliers (payables): due = credit, paid = debit
      // For employees: advance = debit, expense = credit
      //   balance = credit - debit = expenses - advances
      //   negative => employee owes the company (unspent advance)
      //   positive => company owes the employee (reimburse out of pocket)
      let debit = 0;
      let credit = 0;

      if (isEmployee) {
        debit = entry.type === 'advance' ? entry.amount : 0;
        credit = entry.type === 'expense' ? entry.amount : 0;
      } else if (entityType === 'customer') {
        debit = isDue ? entry.amount : 0;
        credit = isPaid ? entry.amount : 0;
      } else {
        credit = isDue ? entry.amount : 0;
        debit = isPaid ? entry.amount : 0;
      }

      // For customers: negative balance = they owe us, positive = we owe them
      // For suppliers: positive balance = we owe them, negative = they owe us
      // For employees: negative = employee owes us, positive = we owe them
      // Balance = credit - debit
      runningBalance += credit - debit;

      const resolvedSale = entry.referenceType === 'sale' ? sales.get(entry.referenceId) : null;
      const resolvedPurchase =
        entry.referenceType === 'purchase' ? purchases.get(entry.referenceId) : null;
      const resolvedPayment =
        entry.referenceType === 'payment' ? paymentMap.get(entry.referenceId) : null;
      const resolvedExpense =
        entry.referenceType === 'expense' ? expenses.get(entry.referenceId) : null;

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
            return (
              (resolvedPurchase as any).items?.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0,
              ) || null
            );
          }
        }
        return null;
      })();

      // particulars: payment method
      const particulars: string | null = (() => {
        if (isEmployee) {
          if (entry.type === 'advance') return resolvedPayment?.paymentMethod || null;
          return resolvedExpense?.paymentMethod || null;
        }
        if (isDue) {
          if (resolvedSale?.paymentMethod) return resolvedSale.paymentMethod;
          if (
            resolvedPurchase &&
            'paymentMethod' in resolvedPurchase &&
            resolvedPurchase.paymentMethod
          ) {
            return (resolvedPurchase as any).paymentMethod;
          }
        } else {
          // paid row
          if (resolvedPayment?.paymentMethod) return resolvedPayment.paymentMethod;
          if (resolvedSale?.paymentMethod) return resolvedSale.paymentMethod;
          if (
            resolvedPurchase &&
            'paymentMethod' in resolvedPurchase &&
            resolvedPurchase.paymentMethod
          ) {
            return (resolvedPurchase as any).paymentMethod;
          }
        }
        return null;
      })();

      // narration
      const narration: string = (() => {
        if (isEmployee) {
          if (entry.type === 'advance') {
            const note = resolvedPayment?.note || '';
            return note ? `Advance given — ${note}` : 'Advance given to employee';
          }
          return resolvedExpense?.purpose
            ? `Expense - ${resolvedExpense.purpose}`
            : entry.description || 'Expense';
        }
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
    const partyResponse =
      entityType === 'employee'
        ? {
            id: party.id,
            name: (party as Employee).name || '',
            employeeId: (party as Employee).employeeId || null,
            phoneNumber: (party as Employee).phoneNumber || null,
            email: (party as Employee).email || null,
            designation: (party as Employee).designation || null,
          }
        : {
            id: party.id,
            name:
              (entityType === 'customer'
                ? (party as Customer).name
                : (party as Supplier).companyName) || '',
            companyName:
              (entityType === 'customer'
                ? (party as Customer).companyName
                : (party as Supplier).companyName) || null,
            contactNumber: (party as Customer | Supplier).contactNumber || null,
            address: (party as Customer | Supplier).address || null,
            ...(entityType === 'customer'
              ? { customerType: (party as Customer).customerType }
              : {}),
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
