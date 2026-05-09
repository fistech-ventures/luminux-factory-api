import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class MenuService extends BaseService<Menu> {
  constructor(
    @InjectRepository(Menu)
    private readonly _repo: Repository<Menu>,
  ) {
    super(_repo);
  }
}
