import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { FormSubmit } from '../entities/formSubmits.entity';

@Injectable()
export class FormSubmitService extends BaseService<FormSubmit> {
  constructor(
    @InjectRepository(FormSubmit)
    public readonly _repo: Repository<FormSubmit>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
