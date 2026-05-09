import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { ProductQuestionAnswer } from '../entities/productQuestionAnswer.entity';

@Injectable()
export class ProductQuestionAnswerService extends BaseService<ProductQuestionAnswer> {
  constructor(
    @InjectRepository(ProductQuestionAnswer)
    private readonly _repo: Repository<ProductQuestionAnswer>
  ) {
    super(_repo);
  }
}
