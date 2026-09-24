import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CreateInvestmentDTO } from '../dtos/create.dto';
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
}
