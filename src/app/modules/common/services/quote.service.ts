import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';

import { Quote } from '../entities/quote.entity';

@Injectable()
export class QuoteService extends BaseService<Quote> {
  constructor(
    @InjectRepository(Quote)
    public readonly _repo: Repository<Quote>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
