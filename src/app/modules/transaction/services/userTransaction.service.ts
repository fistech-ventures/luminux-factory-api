import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { IFindBaseOptions } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { asyncForEach, generateCode } from '@src/shared';
import {
  Between,
  DataSource,
  FindManyOptions,
  FindOneOptions,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ApproveTransactionDTO } from '../dtos/transaction/approve.dto';
import { UserTransaction } from '../entities/userTransaction.entity';
import { ENUM_TRANSACTION_STATUS } from '../enums';

@Injectable()
export class UserTransactionService extends BaseService<UserTransaction> {
  constructor(
    @InjectRepository(UserTransaction)
    private readonly _repo: Repository<UserTransaction>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

  async generateUniqueCode(queryRunner: QueryRunner): Promise<string> {
    let counter = 0;
    let isExist = true;
    let code: string;

    while (isExist) {
      code = `${generateCode('TXN')}${counter}`;

      isExist = await queryRunner.manager.exists(UserTransaction, {
        where: { code },
      });

      if (isExist) {
        counter++;
      }
    }
    return code;
  }

  async findOne(options?: FindOneOptions<UserTransaction>): Promise<UserTransaction> {
    return this.repo.findOne(options);
  }

  async findById(
    id: string,
    options?: IFindBaseOptions<UserTransaction>,
  ): Promise<UserTransaction> {
    return this.findOne({ where: { id }, ...options });
  }

  public async find(options?: FindManyOptions<UserTransaction>): Promise<UserTransaction[]> {
    return this.repo.find(options);
  }

  async findAll(
    query,
    options?: IFindBaseOptions<UserTransaction>,
  ): Promise<SuccessResponse<UserTransaction[]>> {
    if (query?.startDate && query?.endDate) {
      query['createdAt'] = Between(query?.startDate, query?.endDate);
    }
    delete query?.startDate;
    delete query?.endDate;

    return this.findAllBase(query, options);
  }

  async approveTransactions(body: ApproveTransactionDTO): Promise<Partial<UserTransaction>[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const transactions: Partial<UserTransaction>[] = [];
    try {
      if (body.transactions?.length) {
        await asyncForEach(body.transactions, async (item: (typeof transactions)[0]) => {
          const tr = await queryRunner.manager.findOne(UserTransaction, {
            where: {
              id: item.id,
              status: Not(ENUM_TRANSACTION_STATUS.APPROVED),
            },
            relations: {},
          });

          if (!tr) throw new BadRequestException('Transaction not found or Already Approved !');
          if (tr.isForTest) throw new BadRequestException('Test Transaction can not be approved !');
        });
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }

    return transactions;
  }

  async createOne(payload: UserTransaction): Promise<UserTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // transaction is not approved by default when created
      if (payload.status === ENUM_TRANSACTION_STATUS.APPROVED) {
        payload.status = ENUM_TRANSACTION_STATUS.PENDING;
      }

      payload.transactionTime = payload.transactionTime ?? new Date();

      const createdData = await queryRunner.manager.save(UserTransaction, payload);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findById(createdData?.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }
}
