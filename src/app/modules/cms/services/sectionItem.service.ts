import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { SectionItem } from '../entities/sectionItems.entity';

@Injectable()
export class SectionItemService extends BaseService<SectionItem> {
  constructor(
    @InjectRepository(SectionItem)
    private readonly _repo: Repository<SectionItem>,
  ) {
    super(_repo);
  }
}
