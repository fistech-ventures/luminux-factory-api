import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import {
  DataSource,
  Repository
} from 'typeorm';
import { TransactionSource } from '../entities/transactionSource.entity';

@Injectable()
export class TransactionSourceService extends BaseService<TransactionSource> {
  constructor(
    @InjectRepository(TransactionSource)
    private readonly _repo: Repository<TransactionSource>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }

}
