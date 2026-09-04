import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { SuccessResponse } from '@src/app/types';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateLedgerDTO, UpdateLedgerDTO, FilterLedgerDTO } from '../dtos/ledger.dto';
import { Ledger } from '../entities/ledger.entity';

@Injectable()
export class LedgerService extends BaseService<Ledger> {
  constructor(
    @InjectRepository(Ledger)
    private readonly _repo: Repository<Ledger>,
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

    return {
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
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

    return {
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
    };
  }
}
