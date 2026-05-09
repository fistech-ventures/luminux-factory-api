import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { DataSource, Repository } from 'typeorm';
import { PaymentAccount } from '../entities/paymentAccount.entity';

@Injectable()
export class PaymentAccountService extends BaseService<PaymentAccount> {
  constructor(
    @InjectRepository(PaymentAccount)
    public readonly _repo: Repository<PaymentAccount>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
