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
import { CustomerService } from '../../services/customer.service';
import { CreateCustomerDTO } from '../../dtos/create.dto';
import { Customer } from '../../entities/customer.entity';
import { CustomerFilterDTO } from '../../dtos/filter.dto';
import { UpdateCustomerDTO } from '../../dtos/update.dto';
import { InternalRequestInterceptor } from '@src/app/interceptors';

@ApiTags('Customer')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/customer')
export class CustomerInternalController {
  constructor(private readonly customerService: CustomerService) {}

  // RELATIONS: FindOptionsRelations<Customer> = {};

  @Post()
  async create(@Body() payload: CreateCustomerDTO): Promise<Customer> {
    return await this.customerService.createCustomer(payload);
  }

  @Get()
  async findAll(@Query() query: CustomerFilterDTO): Promise<any> {
    return await this.customerService.findAllBase(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    return await this.customerService.findByIdBase(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateCustomerDTO): Promise<Customer> {
    return await this.customerService.updateCustomer(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.customerService.deleteOneBase(id);
  }
}
