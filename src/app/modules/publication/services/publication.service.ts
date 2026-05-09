import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { Publication } from '../entities/publication.entity';

@Injectable()
export class PublicationService extends BaseService<Publication> {
  constructor(
    @InjectRepository(Publication)
    private readonly _repo: Repository<Publication>,
  ) {
    super(_repo);
  }
}
