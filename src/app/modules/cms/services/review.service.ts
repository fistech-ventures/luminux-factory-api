
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewService extends BaseService<Review> {
  constructor(
    @InjectRepository(Review)
    private readonly _repo: Repository<Review>,
  ) {
    super(_repo);
  }
}
