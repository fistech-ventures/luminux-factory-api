import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { BaseBulkDeleteDTO } from '@src/app/base/baseBulkDelete.dto';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { SubCategoryCreateDTO } from '../../dtos/subCategory/create.dto';
import { SubCategoryFilterDTO } from '../../dtos/subCategory/filter.dto';
import { SubCategoryUpdateDTO } from '../../dtos/subCategory/update.dto';
import { Category } from '../../entities/category.entity';
import { SubCategoryService } from '../../services/subCategory.service';

@ApiTags('SubCategory')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/sub-categories')
export class SubCategoryInternalController {
  constructor(private readonly service: SubCategoryService) {}

  @Get()
  async findAll(@Query() query: SubCategoryFilterDTO): Promise<SuccessResponse<Category[]>> {
    query['sortBy'] = query.sortBy || 'position';
    return this.service.findAllSubCategories(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Category> {
    return this.service.findSubCategoryById(id);
  }

  @Post()
  async create(@Body() body: SubCategoryCreateDTO): Promise<Category> {
    return this.service.createSubCategory(body);
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: SubCategoryUpdateDTO,
  ): Promise<Category> {
    return this.service.updateSubCategory(id, body);
  }

  @Delete('bulk')
  async deleteBulk(@Body() body: BaseBulkDeleteDTO): Promise<SuccessResponse> {
    return this.service.bulkDeleteSubCategories(body.ids);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteSubCategory(id);
  }
}
