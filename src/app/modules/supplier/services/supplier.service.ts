import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { CreateSupplierDTO } from '../dtos/create.dto';
import { Supplier } from '../entities/supplier.entity';
import { UpdateSupplierDTO } from '../dtos/update.dto';

@Injectable()
export class SupplierService extends BaseService<Supplier> {
  constructor(
    @InjectRepository(Supplier)
    private readonly _repo: Repository<Supplier>,
  ) {
    super(_repo);
  }

  async createSupplier(payload: CreateSupplierDTO): Promise<Supplier> {
    return this.createOneBase(payload as any);
  }

  async updateSupplier(id: string, payload: UpdateSupplierDTO): Promise<Supplier> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }
}
