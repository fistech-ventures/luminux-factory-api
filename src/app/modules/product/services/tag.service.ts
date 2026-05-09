import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
@Injectable()
export class TagService extends BaseService<Tag> {
  constructor(
    @InjectRepository(Tag)
    public readonly _repo: Repository<Tag>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}