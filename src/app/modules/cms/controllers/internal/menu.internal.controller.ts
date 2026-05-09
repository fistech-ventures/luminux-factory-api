import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheRevalidateKeys } from '@src/app/decorators/cacheRevalidate.decorator';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { MenuCreateDTO } from '../../dtos/menu/create.dto';
import { MenuFilterDTO } from '../../dtos/menu/filter.dto';
import { MenuUpdateDTO } from '../../dtos/menu/update.dto';
import { Menu } from '../../entities/menu.entity';
import { MenuService } from '../../services/menu.service';

@ApiTags('CMS#Menu')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/menu')
export class MenuInternalController {
  constructor(private readonly service: MenuService) { }

  RELATIONS: FindOptionsRelations<Menu> = { childrens: true };

  @Get()
  async findAll(
    @Query() query: MenuFilterDTO,
  ): Promise<SuccessResponse<Menu[]>> {
    query['sortBy'] = query['sortBy'] || 'position';
    query['sortOrder'] = query['sortOrder'] || 'ASC';
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Menu> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['menu'])
  @UseInterceptors(CacheInterceptor)
  @Post()
  async createOne(@Body() body: MenuCreateDTO): Promise<Menu> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['menu'])
  @UseInterceptors(CacheInterceptor)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: MenuUpdateDTO,
  ): Promise<Menu> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
