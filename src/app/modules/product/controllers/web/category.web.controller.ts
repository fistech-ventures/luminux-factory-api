import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { CategoryFilterDTO } from '../../dtos/category/filter.dto';
import { Category } from '../../entities/category.entity';
import { CategoryService } from '../../services/category.service';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { SortOrder } from '@src/app/base';

@ApiTags('Category')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/categories')
export class CategoryWebController {
  constructor(private readonly service: CategoryService) { }
  RELATIONS: FindOptionsRelations<Category> = {};

  @Public()
  @Get()
  async findAll(@Query() query: CategoryFilterDTO): Promise<SuccessResponse<Category[]>> {
    query['sortBy'] = 'position';
    query['sortOrder'] = SortOrder.ASC;
    query['isActive'] = true;
    query['parentId'] = null;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Category> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }
}