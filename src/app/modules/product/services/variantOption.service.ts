import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { VariantOption } from '../entities/variantOption.entity';
@Injectable()
export class VariantOptionService extends BaseService<VariantOption> {
  constructor(
    @InjectRepository(VariantOption)
    public readonly _repo: Repository<VariantOption>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}