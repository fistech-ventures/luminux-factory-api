import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { CreateExpenseDTO } from '../dtos/create.dto';
import { Expense } from '../entities/expense.entity';
import { UpdateExpenseDTO } from '../dtos/update.dto';

@Injectable()
export class ExpenseService extends BaseService<Expense> {
  constructor(
    @InjectRepository(Expense)
    private readonly _repo: Repository<Expense>,
  ) {
    super(_repo);
  }

  async createExpense(payload: CreateExpenseDTO): Promise<Expense> {
    return this.createOneBase(payload as any);
  }

  async updateExpense(id: string, payload: UpdateExpenseDTO): Promise<Expense> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }
}
