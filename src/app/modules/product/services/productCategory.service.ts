import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { ProductCategory } from '../entities/productCategories.entity';

@Injectable()
export class ProductCategoryService extends BaseService<ProductCategory> {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly _repo: Repository<ProductCategory>
  ) {
    super(_repo);
  }
}
