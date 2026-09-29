import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { Product } from '../../product/entities/product.entity';
import { DashboardQueryDTO } from '../dtos/dashboard-query.dto';

export interface IDashboardSummary {
  amount: number;
  count: number;
}

export interface IChartPoint {
  date: string;
  amount: number;
  count?: number;
}

export interface IProfitChartPoint {
  date: string;
  profit: number;
}

export interface IDashboardStatsResponse {
  todaySales: IDashboardSummary;
  lifetimeSales: IDashboardSummary;
  todayPurchase: IDashboardSummary;
  todayExpense: IDashboardSummary;
  totalProducts: number;
  totalProductsValuation: number;
  recentSales: Sale[];
  salesChart: IChartPoint[];
  profitChart: IProfitChartPoint[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {
    this.saleRelations = {
      customer: true,
      soldBy: true,
      items: { product: true, variant: true },
    };
  }

  private readonly saleRelations: FindOptionsRelations<Sale>;

  async getDashboardStats(query: DashboardQueryDTO): Promise<IDashboardStatsResponse> {
    const today = this.todayDateString();
    const recentLimit = Number(query.recentLimit) || 5;

    const { rangeStart, rangeEnd } = this.resolveChartRange(query);

    const [
      todaySales,
      lifetimeSales,
      todayPurchase,
      todayExpense,
      productStats,
      salesChartRows,
      profitChartRows,
      recentSales,
    ] = await Promise.all([
      this.summaryByDate(this.saleRepo, 'grandTotal', 'date', today, today),
      this.summaryByDate(this.saleRepo, 'grandTotal', 'date', undefined, undefined),
      this.summaryByDate(this.purchaseRepo, 'totalPurchaseAmount', 'purchaseDate', today, today),
      this.summaryByDate(this.expenseRepo, 'amountSpent', 'date', today, today),
      this.dataSource
        .query(
          // Soft-deleted products must not count towards the stock valuation.
          `SELECT COUNT(*)::int AS "count",
                  COALESCE(SUM(p."stock" * p."sourcingPrice"), 0) AS "valuation"
           FROM "products" p
           WHERE p."isActive" = true
             AND p."isDeleted" = false`,
        )
        .then((rows: any[]) => rows?.[0] || { count: '0', valuation: '0' }),
      this.dataSource.query(
        `
        SELECT s."date" AS "date",
               COALESCE(SUM(s."grandTotal"), 0) AS "amount",
               COUNT(*)::int AS "count"
        FROM "sales" s
        WHERE s."isActive" = true
          AND s."isDeleted" = false
          AND s."date" >= $1
          AND s."date" <= $2
        GROUP BY s."date"
        ORDER BY s."date" ASC
        `,
        [rangeStart, rangeEnd],
      ),
      this.dataSource.query(
        `
        SELECT s."date" AS "date",
               ROUND(
                 (COALESCE(SUM(s."grandTotal"), 0)
                  - COALESCE(SUM(si."sourcingPrice" * si."quantity"), 0))::numeric,
                 2
               )::double precision AS "profit"
        FROM "sales" s
        LEFT JOIN "sale_items" si ON si."saleId" = s."id" AND si."isDeleted" = false
        WHERE s."isActive" = true
          AND s."isDeleted" = false
          AND s."date" >= $1
          AND s."date" <= $2
        GROUP BY s."date"
        ORDER BY s."date" ASC
        `,
        [rangeStart, rangeEnd],
      ),
      this.saleRepo.find({
        where: { isActive: true, isDeleted: false },
        relations: this.saleRelations,
        order: { createdAt: 'DESC' },
        take: recentLimit,
      }),
    ]);

    const dates = this.generateDateRange(rangeStart, rangeEnd);

    const salesByDate: Record<string, IChartPoint> = {};
    salesChartRows.forEach((row: any) => {
      salesByDate[this.toDateString(new Date(row.date))] = {
        date: this.toDateString(new Date(row.date)),
        amount: Number(row.amount) || 0,
        count: Number(row.count) || 0,
      };
    });

    const profitByDate: Record<string, number> = {};
    profitChartRows.forEach((row: any) => {
      profitByDate[this.toDateString(new Date(row.date))] = Number(row.profit) || 0;
    });

    return {
      todaySales: this.toSummary(todaySales),
      lifetimeSales: this.toSummary(lifetimeSales),
      todayPurchase: this.toSummary(todayPurchase),
      todayExpense: this.toSummary(todayExpense),
      totalProducts: Number(productStats?.count) || 0,
      totalProductsValuation: Number(productStats?.valuation) || 0,
      recentSales,
      salesChart: dates.map((date) => salesByDate[date] || { date, amount: 0, count: 0 }),
      profitChart: dates.map((date) => ({ date, profit: profitByDate[date] || 0 })),
    };
  }

  /**
   * Chart range: explicit startDate/endDate when given, otherwise the last
   * N days (default 7, including today).
   */
  private resolveChartRange(query: DashboardQueryDTO): {
    rangeStart: string;
    rangeEnd: string;
  } {
    if (query.startDate || query.endDate) {
      const start = query.startDate ? this.toDateString(new Date(query.startDate)) : undefined;
      const end = query.endDate ? this.toDateString(new Date(query.endDate)) : undefined;

      if (start && end && start > end) {
        return { rangeStart: end, rangeEnd: start };
      }
      return {
        rangeStart: start || '1970-01-01',
        rangeEnd: end || this.todayDateString(),
      };
    }

    const days = Number(query.days) || 7;
    const rangeEnd = new Date();
    const rangeStart = new Date();
    rangeStart.setDate(rangeEnd.getDate() - (days - 1));

    return {
      rangeStart: this.toDateString(rangeStart),
      rangeEnd: this.toDateString(rangeEnd),
    };
  }

  private async summaryByDate(
    repo: Repository<Sale | Purchase | Expense>,
    amountColumn: string,
    dateColumn: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<{ amount: string; count: string }> {
    const table = repo.metadata.tableName;
    const hasRange = Boolean(fromDate && toDate);
    const rows = await this.dataSource.query(
      `SELECT COALESCE(SUM(e."${amountColumn}"), 0) AS "amount", COUNT(*)::int AS "count"
       FROM "${table}" e
       WHERE e."isActive" = true
         AND e."isDeleted" = false
       ${hasRange ? `AND e."${dateColumn}" >= $1 AND e."${dateColumn}" <= $2` : ''}`,
      hasRange ? [fromDate, toDate] : [],
    );
    return rows?.[0] || { amount: '0', count: '0' };
  }

  private toSummary(row: { amount: string; count: string }): IDashboardSummary {
    return {
      amount: Number(row?.amount) || 0,
      count: Number(row?.count) || 0,
    };
  }

  private generateDateRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const cur = new Date(start);
    const last = new Date(end);

    if (Number.isNaN(cur.getTime()) || Number.isNaN(last.getTime()) || cur > last) {
      return dates;
    }

    while (cur <= last) {
      dates.push(this.toDateString(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }

  private toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private todayDateString(): string {
    return this.toDateString(new Date());
  }
}
