import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
  constructor(
    @InjectRepository(Feedback)
    private readonly _repo: Repository<Feedback>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
