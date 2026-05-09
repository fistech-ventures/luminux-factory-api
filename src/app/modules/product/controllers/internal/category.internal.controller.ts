import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { CategoryCreateDTO } from '../../dtos/category/create.dto';
import { CategoryFilterDTO } from '../../dtos/category/filter.dto';
import { CategoryUpdateDTO } from '../../dtos/category/update.dto';
import { Category } from '../../entities/category.entity';
import { CategoryService } from '../../services/category.service';

@ApiTags('Category')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/categories')
export class CategoryInternalController {
  constructor(private readonly service: CategoryService) { }
  RELATIONS: FindOptionsRelations<Category> = {};

  @Get()
  async findAll(@Query() query: CategoryFilterDTO): Promise<SuccessResponse<Category[]>> {
    query['sortBy'] = 'position';
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Category> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: CategoryCreateDTO): Promise<Category> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: CategoryUpdateDTO,
  ): Promise<Category> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}