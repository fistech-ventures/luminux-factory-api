import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { ProductRequest } from '../entities/productRequest.entity';

@Injectable()
export class ProductRequestService extends BaseService<ProductRequest> {
  constructor(
    @InjectRepository(ProductRequest)
    private readonly _repo: Repository<ProductRequest>
  ) {
    super(_repo);
  }
}
