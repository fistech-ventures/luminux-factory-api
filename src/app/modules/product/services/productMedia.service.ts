import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { ProductMedia } from '../entities/productMedia.entity';

@Injectable()
export class ProductMediaService extends BaseService<ProductMedia> {
  constructor(
    @InjectRepository(ProductMedia)
    private readonly _repo: Repository<ProductMedia>
  ) {
    super(_repo);
  }
}
