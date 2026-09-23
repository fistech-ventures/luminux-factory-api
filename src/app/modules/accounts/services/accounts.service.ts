import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  loadExpenses,
  loadParties,
  loadPurchases,
  loadSales,
  partyKey,
} from '@src/app/helpers/transaction-details.helper';
import { ENUM_PAYMENT_METHODS, ENUM_TRANSACTION_TYPES } from '@src/shared';
import { DataSource, Repository } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { AccountTransactionFilterDTO } from '../dtos/transaction-filter.dto';

export interface IAccountBalance {
  paymentMethod: ENUM_PAYMENT_METHODS;
  balance: number;
}

export interface IAccountBalancesResponse {
  totalBalance: number;
  accounts: IAccountBalance[];
}

export interface IAccountTransaction {
  id: string;
  transactionDate: Date;
  transactionType: ENUM_TRANSACTION_TYPES;
  paymentMethod: ENUM_PAYMENT_METHODS;
  amount: number;
  referenceType: 'sale' | 'purchase' | 'expense' | 'payment';
  referenceId: string;
  description: string;
  entityType?: string;
  entityId?: string;
  // For payment rows: the sale/purchase the payment settles, if any.
  linkedReferenceType?: string;
  linkedReferenceId?: string;
  // Resolved details attached to the response.
  party?: Customer | Supplier | Employee | null;
  reference?: Sale | Purchase | Expense | null;
}

export interface IAccountTransactionsResponse {
  data: IAccountTransaction[];
  total: number;
  page: number;
  limit: number;
  skip: number;
  totalCashIn: number;
  totalCashOut: number;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Company balance per payment method (cash, bKash, nagad, rocket, upay, bank).
   *
   * Balance = money in - money out, per payment method:
   *   + sales.paidAmount        (customer paid at sale time)
   *   + payments to customers   (later collections)
   *   - purchases.paidAmount    (paid to supplier at purchase time)
   *   - expenses.amountSpent    (company expenses only, not employee advances)
   *   - payments to suppliers   (later payments)
   *   - payments to employees   (advances handed to employees)
   *
   * Employee expenses never hit these balances: the cash already left the
   * company when the advance was paid, and is tracked on the employee ledger.
   *
   * totalBalance is the sum of every payment method balance.
   */
  async getAccountBalances(): Promise<IAccountBalancesResponse> {
    const [sales, purchases, expenses, payments] = await Promise.all([
      this.sumByPaymentMethod(this.saleRepo, 'paidAmount'),
      this.sumByPaymentMethod(this.purchaseRepo, 'paidAmount'),
      this.sumByPaymentMethod(this.expenseRepo, 'amountSpent', 'e."employeeId" IS NULL'),
      this.dataSource.query(
        `SELECT p."paymentMethod" AS "paymentMethod", p."entityType" AS "entityType", SUM(p."amount") AS "amount"
         FROM "payments" p
         WHERE p."isActive" = true
         GROUP BY p."paymentMethod", p."entityType"`,
      ),
    ]);

    // Seed every payment method with 0 so the dashboard always shows all accounts.
    const balances: Record<string, number> = {};
    Object.values(ENUM_PAYMENT_METHODS).forEach((method) => {
      balances[method] = 0;
    });

    sales.forEach((row) => {
      balances[row.paymentMethod] += Number(row.amount) || 0;
    });

    payments
      .filter((row) => row.entityType === 'customer')
      .forEach((row) => {
        balances[row.paymentMethod] += Number(row.amount) || 0;
      });

    purchases.forEach((row) => {
      balances[row.paymentMethod] -= Number(row.amount) || 0;
    });

    expenses.forEach((row) => {
      balances[row.paymentMethod] -= Number(row.amount) || 0;
    });

    payments
      .filter((row) => row.entityType === 'supplier' || row.entityType === 'employee')
      .forEach((row) => {
        balances[row.paymentMethod] -= Number(row.amount) || 0;
      });

    const accounts: IAccountBalance[] = Object.entries(balances).map(
      ([paymentMethod, balance]) => ({
        paymentMethod: paymentMethod as ENUM_PAYMENT_METHODS,
        balance: Number(balance) || 0,
      }),
    );

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return { totalBalance, accounts };
  }

  /**
   * Unified account transactions view: every money movement across the app -
   * sales paid amounts, purchases paid amounts, expenses, and payments
   * (customer collections / supplier payments) - shown as one feed with
   * transactionType cashIn / cashOut.
   *
   * Filterable by account (paymentMethod), cashIn/cashOut, and date range.
   */
  async getTransactions(
    filters: AccountTransactionFilterDTO,
  ): Promise<IAccountTransactionsResponse> {
    const { accountType, transactionType, startDate, endDate } = filters;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const cashIn = ENUM_TRANSACTION_TYPES.CASH_IN;
    const cashOut = ENUM_TRANSACTION_TYPES.CASH_OUT;

    // Every branch shares the same three params: $1 paymentMethod, $2 start, $3 end.
    const unionSql = `
      SELECT
        s.id AS id,
        s."date" AS "transactionDate",
        'sale' AS "referenceType",
        s.id AS "referenceId",
        '${cashIn}' AS "transactionType",
        s."paymentMethod" AS "paymentMethod",
        s."paidAmount" AS "amount",
        ('Sale ' || COALESCE(s."invoiceNo", '')) AS "description",
        'customer' AS "entityType",
        s."customerId"::text AS "entityId",
        NULL AS "linkedReferenceType",
        NULL AS "linkedReferenceId"
      FROM "sales" s
      WHERE s."isActive" = true
        AND ($1::text IS NULL OR s."paymentMethod" = $1)
        AND ($2::date IS NULL OR s."date" >= $2)
        AND ($3::date IS NULL OR s."date" <= $3)
      UNION ALL
      SELECT
        p.id,
        p."purchaseDate",
        'purchase',
        p.id,
        '${cashOut}',
        p."paymentMethod",
        p."paidAmount",
        'Purchase',
        'supplier' AS "entityType",
        p."supplierId"::text AS "entityId",
        NULL AS "linkedReferenceType",
        NULL AS "linkedReferenceId"
      FROM "purchases" p
      WHERE p."isActive" = true
        AND ($1::text IS NULL OR p."paymentMethod" = $1)
        AND ($2::date IS NULL OR p."purchaseDate" >= $2)
        AND ($3::date IS NULL OR p."purchaseDate" <= $3)
      UNION ALL
      SELECT
        e.id,
        e."date",
        'expense',
        e.id,
        '${cashOut}',
        e."paymentMethod",
        e."amountSpent",
        e."purpose",
        NULL AS "entityType",
        NULL AS "entityId",
        NULL AS "linkedReferenceType",
        NULL AS "linkedReferenceId"
      FROM "expenses" e
      WHERE e."isActive" = true
        AND e."employeeId" IS NULL
        AND ($1::text IS NULL OR e."paymentMethod" = $1)
        AND ($2::date IS NULL OR e."date" >= $2)
        AND ($3::date IS NULL OR e."date" <= $3)
      UNION ALL
      SELECT
        pay.id,
        pay."paymentDate",
        'payment',
        pay.id,
        CASE WHEN pay."entityType" = 'customer' THEN '${cashIn}' ELSE '${cashOut}' END,
        pay."paymentMethod",
        pay."amount",
        COALESCE(pay."note",
          CASE WHEN pay."entityType" = 'customer'
            THEN 'Collection from customer'
            WHEN pay."entityType" = 'employee'
            THEN 'Advance to employee'
            ELSE 'Payment to supplier' END),
        pay."entityType" AS "entityType",
        pay."entityId"::text AS "entityId",
        pay."referenceType" AS "linkedReferenceType",
        pay."referenceId"::text AS "linkedReferenceId"
      FROM "payments" pay
      WHERE pay."isActive" = true
        AND ($1::text IS NULL OR pay."paymentMethod" = $1)
        AND ($2::date IS NULL OR pay."paymentDate" >= $2)
        AND ($3::date IS NULL OR pay."paymentDate" <= $3)
    `;

    const params: any[] = [
      accountType || null,
      startDate || null,
      endDate || null,
      transactionType || null,
      limit,
      skip,
    ];

    const wrapped = `SELECT * FROM ( ${unionSql} ) t WHERE ($4::text IS NULL OR t."transactionType" = $4)`;

    const [rows, summaryRows] = await Promise.all([
      this.dataSource.query(
        `${wrapped} ORDER BY t."transactionDate" DESC, t.id DESC LIMIT $5 OFFSET $6`,
        params,
      ),
      this.dataSource.query(
        `SELECT
           COUNT(*)::int AS "total",
           COALESCE(SUM(CASE WHEN t."transactionType" = '${cashIn}' THEN t."amount" END), 0) AS "totalCashIn",
           COALESCE(SUM(CASE WHEN t."transactionType" = '${cashOut}' THEN t."amount" END), 0) AS "totalCashOut"
         FROM ( ${unionSql} ) t
         WHERE ($4::text IS NULL OR t."transactionType" = $4)`,
        params.slice(0, 4),
      ),
    ]);

    const summary = summaryRows?.[0] || {};
    const transactions = (rows || []) as IAccountTransaction[];

    // Resolve the counterparty and the business document behind every row so
    // the UI can show what each money movement was for.
    const saleIds: string[] = [];
    const purchaseIds: string[] = [];
    const expenseIds: string[] = [];

    for (const transaction of transactions) {
      if (transaction.referenceType === 'sale' && transaction.referenceId) {
        saleIds.push(transaction.referenceId);
      } else if (transaction.referenceType === 'purchase' && transaction.referenceId) {
        purchaseIds.push(transaction.referenceId);
      } else if (transaction.referenceType === 'expense' && transaction.referenceId) {
        expenseIds.push(transaction.referenceId);
      } else if (transaction.referenceType === 'payment') {
        // Payments point at the sale/purchase they settle.
        if (transaction.linkedReferenceType === 'sale' && transaction.linkedReferenceId) {
          saleIds.push(transaction.linkedReferenceId);
        } else if (
          transaction.linkedReferenceType === 'purchase' &&
          transaction.linkedReferenceId
        ) {
          purchaseIds.push(transaction.linkedReferenceId);
        }
      }
    }

    const [parties, sales, purchases, expenses] = await Promise.all([
      loadParties(transactions, this.customerRepo, this.supplierRepo, this.employeeRepo),
      loadSales(saleIds, this.saleRepo),
      loadPurchases(purchaseIds, this.purchaseRepo),
      loadExpenses(expenseIds, this.expenseRepo),
    ]);

    const data: IAccountTransaction[] = transactions.map((transaction) => {
      let reference: Sale | Purchase | Expense | null = null;

      if (transaction.referenceType === 'sale') {
        reference = sales.get(transaction.referenceId) || null;
      } else if (transaction.referenceType === 'purchase') {
        reference = purchases.get(transaction.referenceId) || null;
      } else if (transaction.referenceType === 'expense') {
        reference = expenses.get(transaction.referenceId) || null;
      } else if (transaction.referenceType === 'payment') {
        if (transaction.linkedReferenceType === 'sale') {
          reference = sales.get(transaction.linkedReferenceId) || null;
        } else if (transaction.linkedReferenceType === 'purchase') {
          reference = purchases.get(transaction.linkedReferenceId) || null;
        }
      }

      return {
        ...transaction,
        party: parties.get(partyKey(transaction.entityType, transaction.entityId)) || null,
        reference,
      };
    });

    return {
      data,
      total: Number(summary.total) || 0,
      page,
      limit,
      skip,
      totalCashIn: Number(summary.totalCashIn) || 0,
      totalCashOut: Number(summary.totalCashOut) || 0,
    };
  }

  private async sumByPaymentMethod(
    repo: Repository<Sale | Purchase | Expense>,
    amountColumn: string,
    extraWhere?: string,
  ): Promise<Array<{ paymentMethod: string; amount: string }>> {
    const table = repo.metadata.tableName;
    return this.dataSource.query(
      `SELECT e."paymentMethod" AS "paymentMethod", SUM(e."${amountColumn}") AS "amount"
       FROM "${table}" e
       WHERE e."isActive" = true${extraWhere ? ` AND ${extraWhere}` : ''}
       GROUP BY e."paymentMethod"`,
    );
  }
}
