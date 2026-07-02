import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { SortOrder } from '@src/app/base';
import { SubCategoryFilterDTO } from '../../dtos/subCategory/filter.dto';
import { SubCategory } from '../../entities/subCategory.entity';
import { SubCategoryService } from '../../services/subCategory.service';

@ApiTags('SubCategory')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/sub-categories')
export class SubCategoryWebController {
  constructor(private readonly service: SubCategoryService) {}

  @Public()
  @Get()
  async findAll(@Query() query: SubCategoryFilterDTO): Promise<SuccessResponse<SubCategory[]>> {
    query['sortBy'] = query.sortBy || 'position';
    query['sortOrder'] = query.sortOrder || SortOrder.ASC;
    return this.service.findAllSubCategories(query);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<SubCategory> {
    return this.service.findSubCategoryById(id);
  }
}
