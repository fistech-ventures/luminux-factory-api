import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { MenuFilterDTO } from '../../dtos/menu/filter.dto';
import { Menu } from '../../entities/menu.entity';
import { MenuService } from '../../services/menu.service';

@ApiTags('CMS#Menu')
@ApiBearerAuth()
@Controller('web/menu')
export class MenuWebController {
  constructor(private readonly service: MenuService) { }

  RELATIONS: FindOptionsRelations<Menu> = { childrens: true };

  @CacheKey('menu:lists')
  @CacheTTL(10800) // 10800 seconds = 6 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get()
  async findAll(
    @Query() query: MenuFilterDTO,
  ): Promise<SuccessResponse<Menu[]>> {
    query['isActive'] = true;
    query['sortBy'] = query['sortBy'] || 'position';
    query['sortOrder'] = query['sortOrder'] || 'ASC';
    return this.service.findAllBase(query, {
      relations: this.RELATIONS,
      select: {
        id: true,
        icon: true,
        title: true,
        externalUrl: true,
        type: true,
        pageId: true,
        position: true,
        childrens: {
          id: true,
          icon: true,
          title: true,
          externalUrl: true,
          pageId: true,
          position: true,
        }
      }
    });
  }
}
