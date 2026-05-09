import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { SourceShop } from '../entities/sourceShop.entity';
@Injectable()
export class SourceShopService extends BaseService<SourceShop> {
  constructor(
    @InjectRepository(SourceShop)
    public readonly _repo: Repository<SourceShop>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}