import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { PageSection } from '../entities/pageSection.entity';

@Injectable()
export class PageSectionService extends BaseService<PageSection> {
  constructor(
    @InjectRepository(PageSection)
    private readonly _repo: Repository<PageSection>,
  ) {
    super(_repo);
  }
}
