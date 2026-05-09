import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/orderItem.entity';

@Injectable()
export class OrderItemService extends BaseService<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private readonly _repo: Repository<OrderItem>,
  ) {
    super(_repo);
  }
}
