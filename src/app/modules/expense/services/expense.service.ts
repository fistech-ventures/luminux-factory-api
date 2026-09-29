import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  commitTransaction,
  rollbackTransaction,
  startTransaction,
} from '@src/shared/utils/dborm.utils';
import { CreateExpenseDTO } from '../dtos/create.dto';
import { Expense } from '../entities/expense.entity';
import { UpdateExpenseDTO } from '../dtos/update.dto';
import { LedgerService } from '../../ledger/services/ledger.service';
import { Ledger } from '../../ledger/entities/ledger.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { SuccessResponse } from '@src/app/types';

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
      const { amountSpent, purpose, date, employeeId, spentBy, ...restPayload } = payload;

      const resolvedSpentBy = await this.resolveSpentBy(queryRunner.manager, employeeId, spentBy);

      const expense = queryRunner.manager.create(Expense, {
        ...restPayload,
        amountSpent,
        purpose,
        date,
        employeeId: employeeId || null,
        spentBy: resolvedSpentBy,
      });
      const savedExpense = await queryRunner.manager.save(expense);

      await this.syncLedgerEntry(queryRunner.manager, savedExpense, employeeId);

      await commitTransaction(queryRunner);

      return savedExpense;
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Expense not created');
    }
  }

  async deleteOneBase(id: string): Promise<SuccessResponse> {
    const expense = await this.findOne({ where: { id: id as any } });
    if (!expense) throw new NotFoundException('Expense not found');

    const queryRunner = await startTransaction(this.dataSource);
    try {
      const deletedAt = new Date();
      await queryRunner.manager.update(
        Expense,
        { id, isDeleted: false },
        { isDeleted: true, deletedAt },
      );
      await queryRunner.manager.update(
        Ledger,
        { referenceId: id, referenceType: 'expense', isDeleted: false },
        { isDeleted: true, deletedAt },
      );
      await commitTransaction(queryRunner);
      return new SuccessResponse('Expense soft-deleted successfully', null);
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Expense not deleted');
    }
  }

  async updateExpense(id: string, payload: UpdateExpenseDTO): Promise<Expense> {
    const existingExpense = await this.findOne({ where: { id: id as any } });

    if (!existingExpense) {
      throw new NotFoundException('Expense not found');
    }

    const queryRunner = await startTransaction(this.dataSource);

    try {
      const employeeId =
        payload.employeeId !== undefined ? payload.employeeId : existingExpense.employeeId;
      const spentBy = payload.spentBy !== undefined ? payload.spentBy : existingExpense.spentBy;

      const resolvedSpentBy = await this.resolveSpentBy(queryRunner.manager, employeeId, spentBy);

      await queryRunner.manager.update(
        Expense,
        { id },
        {
          ...payload,
          employeeId: employeeId || null,
          spentBy: resolvedSpentBy,
        },
      );

      const updatedExpense = await queryRunner.manager.findOne(Expense, { where: { id } });

      // Keep the single ledger entry for this expense in sync so the employee /
      // company balances stay correct after an amount, date or owner change.
      const existingLedgerEntry = await queryRunner.manager.findOne(Ledger, {
        where: { referenceId: id, referenceType: 'expense' },
      });

      await this.syncLedgerEntry(
        queryRunner.manager,
        updatedExpense,
        employeeId,
        existingLedgerEntry ?? undefined,
      );

      await commitTransaction(queryRunner);

      return await this.findOne({ where: { id } });
    } catch (error) {
      await rollbackTransaction(queryRunner);
      throw new BadRequestException((error as Error).message || 'Expense not updated');
    }
  }

  /**
   * Resolves the display name for `spentBy`, defaulting to the linked
   * employee's name and validating that the employee exists.
   */
  private async resolveSpentBy(
    manager: EntityManager,
    employeeId?: string | null,
    spentBy?: string,
  ): Promise<string> {
    if (!employeeId) {
      return spentBy;
    }

    const employee = await manager.findOne(Employee, {
      where: { id: employeeId, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(`Employee not found: ${employeeId}`);
    }

    return spentBy || employee.name;
  }

  /**
   * Upserts (or removes) the ledger entry for an expense.
   *
   * - Employee expense: booked against the employee so their running balance
   *   (advance received - money spent) drops. Company account balances are
   *   untouched because the cash already left when the advance was paid.
   * - Regular expense: keeps the historical `expense` ledger entry.
   */
  private async syncLedgerEntry(
    manager: EntityManager,
    expense: Expense | null,
    employeeId: string | undefined | null,
    existingEntry?: Ledger,
  ): Promise<void> {
    const shouldExist = !!expense && Number(expense.amountSpent) > 0;

    const values: Partial<Ledger> = employeeId
      ? {
          entityType: 'employee',
          entityId: employeeId,
          type: 'expense',
          amount: expense?.amountSpent ?? 0,
          referenceId: expense?.id,
          referenceType: 'expense',
          description: `Expense - ${expense?.purpose ?? ''}`,
          transactionDate: expense?.date ? new Date(expense.date) : new Date(),
        }
      : {
          entityType: 'expense',
          entityId: expense?.id,
          type: 'paid',
          amount: expense?.amountSpent ?? 0,
          referenceId: expense?.id,
          referenceType: 'expense',
          description: `Expense - ${expense?.purpose ?? ''}`,
          transactionDate: expense?.date ? new Date(expense.date) : new Date(),
        };

    await this.ledgerService.reconcileLedgerEntry(manager, existingEntry, shouldExist, values);
  }
}
