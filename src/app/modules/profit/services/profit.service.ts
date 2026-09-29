import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '@src/app/types';
import { ENUM_PAYMENT_METHODS } from '@src/shared';
import { DataSource } from 'typeorm';
import { ProfitFilterDTO } from '../dtos/filter.dto';

export interface IProfitEntry {
  id: string;
  invoiceNo?: string;
  date: Date;
  revenue: number;
  totalCost: number;
  profit: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  customerId?: string;
  customerName?: string;
}

export interface IProfitStats {
  totalIncome: number;
  totalCostOfGoodsSold: number;
  totalSalesProfit: number;
  totalExpense: number;
  totalPurchase: number;
  netProfit: number;
}

export interface ILossStats {
  totalLoss: number;
  totalLossCount: number;
}

@Injectable()
export class ProfitService {
  constructor(private readonly dataSource: DataSource) {}

  async getProfitList(filters: ProfitFilterDTO): Promise<SuccessResponse<IProfitEntry[]>> {
    return this.getSalesByProfit(filters, '> 0', 'Profits fetched successfully');
  }

  async getLossList(filters: ProfitFilterDTO): Promise<SuccessResponse<IProfitEntry[]>> {
    return this.getSalesByProfit(filters, '< 0', 'Losses fetched successfully');
  }

  /**
   * Income / expense summary within the date range:
   *   totalIncome     = sum of sale grand totals (revenue)
   *   totalCostOfGoodsSold = cost of the sold items (sourcing price snapshots)
   *   totalSalesProfit = income - cost of goods sold
   *   totalExpense    = sum of expenses
   *   totalPurchase   = sum of purchase amounts (stock spend, shown separately)
   *   netProfit       = totalSalesProfit - totalExpense
   */
  async getProfitStats(filters: ProfitFilterDTO): Promise<IProfitStats> {
    const params: any[] = [filters.startDate || null, filters.endDate || null];

    const [row] = await this.dataSource.query(
      `
      SELECT
        (SELECT COALESCE(SUM(s."grandTotal"), 0)
          FROM "sales" s
          WHERE s."isActive" = true
            AND s."isDeleted" = false
            AND ($1::date IS NULL OR s."date" >= $1)
            AND ($2::date IS NULL OR s."date" <= $2)) AS "totalIncome",
        (SELECT COALESCE(SUM(si."sourcingPrice" * si."quantity"), 0)
          FROM "sale_items" si
          INNER JOIN "sales" s ON s."id" = si."saleId"
          WHERE s."isActive" = true
            AND s."isDeleted" = false
            AND si."isDeleted" = false
            AND ($1::date IS NULL OR s."date" >= $1)
            AND ($2::date IS NULL OR s."date" <= $2)) AS "totalCostOfGoodsSold",
        (SELECT COALESCE(SUM(e."amountSpent"), 0)
          FROM "expenses" e
          WHERE e."isActive" = true
            AND e."isDeleted" = false
            AND ($1::date IS NULL OR e."date" >= $1)
            AND ($2::date IS NULL OR e."date" <= $2)) AS "totalExpense",
        (SELECT COALESCE(SUM(p."totalPurchaseAmount"), 0)
          FROM "purchases" p
          WHERE p."isActive" = true
            AND p."isDeleted" = false
            AND ($1::date IS NULL OR p."purchaseDate" >= $1)
            AND ($2::date IS NULL OR p."purchaseDate" <= $2)) AS "totalPurchase"
      `,
      params,
    );

    const totalIncome = Number(row?.totalIncome) || 0;
    const totalCostOfGoodsSold = Number(row?.totalCostOfGoodsSold) || 0;
    const totalExpense = Number(row?.totalExpense) || 0;
    const totalPurchase = Number(row?.totalPurchase) || 0;

    const totalSalesProfit = Math.round((totalIncome - totalCostOfGoodsSold) * 100) / 100;
    const netProfit = Math.round((totalSalesProfit - totalExpense) * 100) / 100;

    return {
      totalIncome,
      totalCostOfGoodsSold,
      totalSalesProfit,
      totalExpense,
      totalPurchase,
      netProfit,
    };
  }

  /**
   * Loss summary: total money lost on loss-making sales (positive magnitude)
   * and how many sales were loss-making within the filters.
   */
  async getLossStats(filters: ProfitFilterDTO): Promise<ILossStats> {
    const base = this.buildProfitSql('< 0');
    const params: any[] = [
      filters.startDate || null,
      filters.endDate || null,
      filters.paymentMethod || null,
    ];

    const [row] = await this.dataSource.query(
      `
      SELECT
        COUNT(*)::int AS "total",
        COALESCE(SUM(t."profit"), 0) AS "totalLoss"
      FROM ( ${base} ) t
      `,
      params,
    );

    return {
      totalLoss: Math.abs(Number(row?.totalLoss) || 0),
      totalLossCount: Number(row?.total) || 0,
    };
  }

  /**
   * Per-sale profit entries. Profit of a sale = grandTotal (revenue after
   * discount) minus the cost of the sold items (sourcing price snapshots
   * stored on each sale item at sale time).
   *
   * predicate: '> 0' for profitable sales, '< 0' for loss-making sales.
   */
  private buildProfitSql(predicate: string): string {
    return `
      SELECT t.*
      FROM (
        SELECT
          s.id AS id,
          s."invoiceNo" AS "invoiceNo",
          s."date" AS "date",
          s."grandTotal" AS "revenue",
          s."paymentMethod" AS "paymentMethod",
          s."customerId" AS "customerId",
          c."name" AS "customerName",
          COALESCE(SUM(si."sourcingPrice" * si."quantity"), 0) AS "totalCost",
          ROUND(
            (s."grandTotal" - COALESCE(SUM(si."sourcingPrice" * si."quantity"), 0))::numeric,
            2
          )::double precision AS "profit"
        FROM "sales" s
        LEFT JOIN "customers" c ON c."id" = s."customerId" AND c."isDeleted" = false
        LEFT JOIN "sale_items" si ON si."saleId" = s."id" AND si."isDeleted" = false
        WHERE s."isActive" = true
          AND s."isDeleted" = false
          AND ($1::date IS NULL OR s."date" >= $1)
          AND ($2::date IS NULL OR s."date" <= $2)
          AND ($3::text IS NULL OR s."paymentMethod" = $3)
        GROUP BY s.id, c."name"
      ) t
      WHERE t."profit" ${predicate}
    `;
  }

  private async getSalesByProfit(
    filters: ProfitFilterDTO,
    predicate: string,
    message: string,
  ): Promise<SuccessResponse<IProfitEntry[]>> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const base = this.buildProfitSql(predicate);
    const params: any[] = [
      filters.startDate || null,
      filters.endDate || null,
      filters.paymentMethod || null,
      limit,
      skip,
    ];

    const [rows, countRows] = await Promise.all([
      this.dataSource.query(`${base} ORDER BY t."date" DESC, t.id DESC LIMIT $4 OFFSET $5`, params),
      this.dataSource.query(
        `SELECT COUNT(*)::int AS "total" FROM ( ${base} ) sub`,
        params.slice(0, 3),
      ),
    ]);

    return new SuccessResponse<IProfitEntry[]>(message, rows, {
      total: Number(countRows?.[0]?.total) || 0,
      page,
      limit,
      skip,
    });
  }
}
