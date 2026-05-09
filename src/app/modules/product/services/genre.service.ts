import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { Genre } from '../entities/genre.entity';
@Injectable()
export class GenreService extends BaseService<Genre> {
  constructor(
    @InjectRepository(Genre)
    public readonly _repo: Repository<Genre>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}