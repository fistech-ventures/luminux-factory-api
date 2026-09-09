import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ENUM_PAYMENT_METHODS, ENUM_TRANSACTION_TYPES } from '@src/shared';
import { DataSource, Repository } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { Payment } from '../../payments/entities/payment.entity';
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
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Company balance per payment method (cash, bKash, nagad, rocket, upay, bank).
   *
   * Balance = money in - money out, per payment method:
   *   + sales.paidAmount        (customer paid at sale time)
   *   + payments to customers   (later collections)
   *   - purchases.paidAmount    (paid to supplier at purchase time)
   *   - expenses.amountSpent    (expenses)
   *   - payments to suppliers   (later payments)
   *
   * totalBalance is the sum of every payment method balance.
   */
  async getAccountBalances(): Promise<IAccountBalancesResponse> {
    const [sales, purchases, expenses, payments] = await Promise.all([
      this.sumByPaymentMethod(this.saleRepo, 'paidAmount'),
      this.sumByPaymentMethod(this.purchaseRepo, 'paidAmount'),
      this.sumByPaymentMethod(this.expenseRepo, 'amountSpent'),
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
      .filter((row) => row.entityType === 'supplier')
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
        NULL AS "entityType"
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
        NULL
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
        NULL
      FROM "expenses" e
      WHERE e."isActive" = true
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
            ELSE 'Payment to supplier' END),
        pay."entityType"
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

    return {
      data: rows as IAccountTransaction[],
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
  ): Promise<Array<{ paymentMethod: string; amount: string }>> {
    const table = repo.metadata.tableName;
    return this.dataSource.query(
      `SELECT e."paymentMethod" AS "paymentMethod", SUM(e."${amountColumn}") AS "amount"
       FROM "${table}" e
       WHERE e."isActive" = true
       GROUP BY e."paymentMethod"`,
    );
  }
}