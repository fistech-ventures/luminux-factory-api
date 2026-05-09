
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { Form } from '../entities/form.entity';

@Injectable()
export class FormService extends BaseService<Form> {
  constructor(
    @InjectRepository(Form)
    public readonly _repo: Repository<Form>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
