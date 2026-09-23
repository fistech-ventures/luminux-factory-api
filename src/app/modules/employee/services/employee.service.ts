import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { CreateEmployeeDTO } from '../dtos/create.dto';
import { UpdateEmployeeDTO } from '../dtos/update.dto';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeService extends BaseService<Employee> {
  constructor(
    @InjectRepository(Employee)
    private readonly _repo: Repository<Employee>,
  ) {
    super(_repo);
  }

  async createEmployee(payload: CreateEmployeeDTO): Promise<Employee> {
    return this.createOneBase(payload as any);
  }

  async updateEmployee(id: string, payload: UpdateEmployeeDTO): Promise<Employee> {
    await this.isExist({ id: id as any });
    return this.updateOneBase(id, payload as any);
  }
}
