import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentGatewayLog } from '../entities/paymentGatewayLog.entity';
import { BaseService } from '@src/app/base';

@Injectable()
export class PaymentGatewayLogService extends BaseService<PaymentGatewayLog> {
  constructor(
    @InjectRepository(PaymentGatewayLog)
    public readonly _repo: Repository<PaymentGatewayLog>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
