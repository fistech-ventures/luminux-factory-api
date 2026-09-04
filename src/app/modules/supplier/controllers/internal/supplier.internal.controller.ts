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
import { SupplierService } from '../../services/supplier.service';
import { CreateSupplierDTO } from '../../dtos/create.dto';
import { Supplier } from '../../entities/supplier.entity';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UpdateSupplierDTO } from '../../dtos/update.dto';
import { SupplierFilterDTO } from '../../dtos/filter.dto';

@ApiTags('Supplier')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/supplier')
export class SupplierInternalController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async create(@Body() payload: CreateSupplierDTO): Promise<Supplier> {
    return await this.supplierService.createSupplier(payload);
  }

  @Get()
  async findAll(@Query() query: SupplierFilterDTO): Promise<any> {
    return await this.supplierService.findAllBase(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Supplier> {
    return await this.supplierService.findByIdBase(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateSupplierDTO): Promise<Supplier> {
    return await this.supplierService.updateSupplier(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.supplierService.deleteOneBase(id);
  }
}
