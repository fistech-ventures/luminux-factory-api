import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { CreateCustomerDTO } from '../dtos/create.dto';
import { Customer } from '../entities/customer.entity';
import { UpdateCustomerDTO } from '../dtos/update.dto';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @InjectRepository(Customer)
    private readonly _repo: Repository<Customer>,
  ) {
    super(_repo);
  }

  async createCustomer(payload: CreateCustomerDTO): Promise<Customer> {
    return this.createOneBase(payload as any);
  }

  async updateCustomer(id: string, payload: UpdateCustomerDTO): Promise<Customer> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }
}
