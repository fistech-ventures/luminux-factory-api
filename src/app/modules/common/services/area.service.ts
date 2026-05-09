import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { Area } from '../entities/area.entity';

@Injectable()
export class AreaService extends BaseService<Area> {
  constructor(
    @InjectRepository(Area)
    public readonly _repo: Repository<Area>
  ) {
    super(_repo);
  }
}
