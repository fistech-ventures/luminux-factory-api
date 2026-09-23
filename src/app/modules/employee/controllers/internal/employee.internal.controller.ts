import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CreateEmployeeDTO } from '../../dtos/create.dto';
import { EmployeeFilterDTO } from '../../dtos/filter.dto';
import { UpdateEmployeeDTO } from '../../dtos/update.dto';
import { Employee } from '../../entities/employee.entity';
import { EmployeeService } from '../../services/employee.service';

@ApiTags('Employee')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/employee')
export class EmployeeInternalController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async create(@Body() payload: CreateEmployeeDTO): Promise<Employee> {
    return await this.employeeService.createEmployee(payload);
  }

  @Get()
  async findAll(@Query() query: EmployeeFilterDTO): Promise<any> {
    return await this.employeeService.findAllBase(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Employee> {
    return await this.employeeService.findByIdBase(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateEmployeeDTO): Promise<Employee> {
    return await this.employeeService.updateEmployee(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.employeeService.deleteOneBase(id);
  }
}
