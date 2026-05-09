import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { HeroBanner } from '../entities/heroBanner.entity';

@Injectable()
export class HeroBannerService extends BaseService<HeroBanner> {
  constructor(
    @InjectRepository(HeroBanner)
    private readonly _repo: Repository<HeroBanner>,
  ) {
    super(_repo);
  }
}
