import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { DataSource, Repository } from 'typeorm';
import { PaymentGateway } from '../entities/paymentGateway.entity';

@Injectable()
export class PaymentGatewayService extends BaseService<PaymentGateway> {
  constructor(
    @InjectRepository(PaymentGateway)
    private readonly _repo: Repository<PaymentGateway>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
