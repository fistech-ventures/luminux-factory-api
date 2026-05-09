import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';

@Injectable()
export class NoteService extends BaseService<Note> {
  constructor(
    @InjectRepository(Note)
    private readonly _repo: Repository<Note>,
  ) {
    super(_repo);
  }
}
