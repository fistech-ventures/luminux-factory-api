import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { Author } from '../entities/author.entity';

@Injectable()
export class AuthorService extends BaseService<Author> {
  constructor(
    @InjectRepository(Author)
    private readonly _repo: Repository<Author>,
  ) {
    super(_repo);
  }
}
