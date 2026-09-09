import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { DataSource } from 'typeorm';
import { CreateExpenseDTO } from '../dtos/create.dto';
import { Expense } from '../entities/expense.entity';
import { UpdateExpenseDTO } from '../dtos/update.dto';
import { LedgerService } from '../../ledger/services/ledger.service';

@Injectable()
export class ExpenseService extends BaseService<Expense> {
  constructor(
    @InjectRepository(Expense)
    private readonly _repo: Repository<Expense>,
    private readonly dataSource: DataSource,
    private readonly ledgerService: LedgerService,
  ) {
    super(_repo);
  }

  async createExpense(payload: CreateExpenseDTO): Promise<Expense> {
    const queryRunner = await startTransaction(this.dataSource);

    try {
      const { amountSpent, purpose, date, ...restPayload } = payload;

      const expense = queryRunner.manager.create(Expense, {
        ...restPayload,
        amountSpent,
        purpose,
        date,
      });
      const savedExpense = await queryRunner.manager.save(expense);

      // Record the expense in the ledger so it shows up in the transaction
      // history alongside customer/supplier entries.
      await this.ledgerService.createLedgerEntry({
        entityType: 'expense',
        entityId: savedExpense.id,
        type: 'paid',
        amount: amountSpent,
        referenceId: savedExpense.id,
        referenceType: 'expense',
        description: `Expense - ${purpose}`,
        transactionDate: date ? new Date(date) : new Date(),
      });

      await commitTransaction(queryRunner);

      return savedExpense;
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Expense not created');
    }
  }

  async updateExpense(id: string, payload: UpdateExpenseDTO): Promise<Expense> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }
}
