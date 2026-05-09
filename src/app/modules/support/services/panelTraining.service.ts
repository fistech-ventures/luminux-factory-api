import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { DataSource, Repository } from 'typeorm';
import { PanelTraining } from '../entities/panelTraining.entity';

@Injectable()
export class PanelTrainingService extends BaseService<PanelTraining> {
  constructor(
    @InjectRepository(PanelTraining)
    private readonly _repo: Repository<PanelTraining>,
    private readonly dataSource: DataSource,
  ) {
    super(_repo);
  }
}
