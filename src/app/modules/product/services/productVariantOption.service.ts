import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { ProductVariantOption } from '../entities/productVariantOption.entity';
@Injectable()
export class ProductVariantOptionService extends BaseService<ProductVariantOption> {
  constructor(
    @InjectRepository(ProductVariantOption)
    public readonly _repo: Repository<ProductVariantOption>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}