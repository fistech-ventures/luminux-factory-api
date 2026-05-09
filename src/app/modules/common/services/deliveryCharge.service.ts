import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { DeliveryCharge } from '../entities/deliveryCharge.entity';

@Injectable()
export class DeliveryChargeService extends BaseService<DeliveryCharge> {
  constructor(
    @InjectRepository(DeliveryCharge)
    public readonly _repo: Repository<DeliveryCharge>
  ) {
    super(_repo);
  }
}
