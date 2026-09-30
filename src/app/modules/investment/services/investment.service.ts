import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { FindOptionsRelations, Repository } from 'typeorm';
import { SuccessResponse } from '@src/app/types';
import { CreateInvestmentDTO } from '../dtos/create.dto';
import { InvestmentFilterDTO } from '../dtos/filter.dto';
import { UpdateInvestmentDTO } from '../dtos/update.dto';
import { Investment } from '../entities/investment.entity';

@Injectable()
export class InvestmentService extends BaseService<Investment> {
  constructor(
    @InjectRepository(Investment)
    private readonly _repo: Repository<Investment>,
  ) {
    super(_repo);
  }

  public readonly RELATIONS: FindOptionsRelations<Investment> = {
    investor: true,
  };

  async createInvestment(payload: CreateInvestmentDTO): Promise<Investment> {
    return this.createOneBase(payload as any);
  }

  async updateInvestment(id: string, payload: UpdateInvestmentDTO): Promise<Investment> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }

  async findInvestmentById(id: string): Promise<Investment> {
    return this.findByIdBase(id, { relations: this.RELATIONS });
  }

  async findInvestments(
    filters: InvestmentFilterDTO,
  ): Promise<SuccessResponse<Investment[]> & { total: { allInvestors: number; selectedInvestor: number } }> {
    const response = await this.findAllBase(filters as any, { relations: this.RELATIONS });
    const query = this._repo
      .createQueryBuilder('investment')
      .select('COALESCE(SUM(investment.amount), 0)', 'allInvestors')
      .addSelect(
        filters.investorId
          ? 'COALESCE(SUM(CASE WHEN investment.investorId = :investorId THEN investment.amount ELSE 0 END), 0)'
          : '0',
        'selectedInvestor',
      )
      .orderBy()
      .setOption('disable-global-order')
      .where('investment.isDeleted = false');

    if (filters.investorId) query.setParameter('investorId', filters.investorId);
    if (filters.isActive !== undefined) {
      query.andWhere('investment.isActive = :isActive', {
        isActive: String(filters.isActive) === 'true',
      });
    }
    if (filters.startDate) {
      query.andWhere('investment.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('investment.date <= :endDate', { endDate: filters.endDate });
    }
    if (filters.searchTerm?.trim()) {
      query.andWhere('investment.title ILIKE :searchTerm', {
        searchTerm: `%${filters.searchTerm.trim()}%`,
      });
    }

    const totals = await query.getRawOne<{ allInvestors: string; selectedInvestor: string }>();
    return Object.assign(response, {
      total: {
        allInvestors: Number(totals?.allInvestors) || 0,
        selectedInvestor: Number(totals?.selectedInvestor) || 0,
      },
    });
  }
}
