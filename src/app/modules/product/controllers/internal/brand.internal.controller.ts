import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { BrandCreateDTO } from '../../dtos/brand/create.dto';
import { BrandFilterDTO } from '../../dtos/brand/filter.dto';
import { BrandUpdateDTO } from '../../dtos/brand/update.dto';
import { Brand } from '../../entities/brand.entity';
import { BrandService } from '../../services/brand.service';

@ApiTags('Brand')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/brands')
export class BrandInternalController {
  constructor(private readonly service: BrandService) { }
  RELATIONS: FindOptionsRelations<Brand> = {};

  @Get()
  async findAll(@Query() query: BrandFilterDTO): Promise<SuccessResponse<Brand[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Brand> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: BrandCreateDTO): Promise<Brand> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: BrandUpdateDTO,
  ): Promise<Brand> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}