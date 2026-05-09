import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { ProductGenre } from '../entities/productGenres.entity';

@Injectable()
export class ProductGenreService extends BaseService<ProductGenre> {
  constructor(
    @InjectRepository(ProductGenre)
    private readonly _repo: Repository<ProductGenre>
  ) {
    super(_repo);
  }
}
