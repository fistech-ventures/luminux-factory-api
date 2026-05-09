import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly _repo: Repository<Permission>,
  ) {
    super(_repo);
  }

  async upsertBulkPermissions(data): Promise<any> {
    const { permissions = [] } = data;
    if (permissions?.length) {
      const payload = permissions.map((item) => ({
        title: item,
        isActive: true
      }));
      await this._repo.upsert(payload, ["title"]);
    } else {
      throw new BadRequestException("No data to sync!");
    }
    return this.findAllBase({});
  }
}
