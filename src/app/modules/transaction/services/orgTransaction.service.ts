import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { generateCode } from '@src/shared';
import {
  DataSource,
  QueryRunner,
  Repository
} from 'typeorm';
import { OrgTransaction } from '../entities/orgTransaction.entity';

@Injectable()
export class OrgTransactionService extends BaseService<OrgTransaction> {
  constructor(
    @InjectRepository(OrgTransaction)
    private readonly _repo: Repository<OrgTransaction>,
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

      isExist = await queryRunner.manager.exists(OrgTransaction, {
        where: { code },
      });

      if (isExist) {
        counter++;
      }
    }
    return code;
  }

}
