import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    public readonly _repo: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}