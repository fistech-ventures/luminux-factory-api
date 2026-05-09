import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
@Injectable()
export class BrandService extends BaseService<Brand> {
  constructor(
    @InjectRepository(Brand)
    public readonly _repo: Repository<Brand>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}