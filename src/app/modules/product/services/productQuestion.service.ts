import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { ProductQuestion } from '../entities/productQuestion.entity';

@Injectable()
export class ProductQuestionService extends BaseService<ProductQuestion> {
  constructor(
    @InjectRepository(ProductQuestion)
    private readonly _repo: Repository<ProductQuestion>
  ) {
    super(_repo);
  }
}
