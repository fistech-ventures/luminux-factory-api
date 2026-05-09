import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { HeroBannerFilterDTO } from '../../dtos/heroBanner/filter.dto';
import { HeroBanner } from '../../entities/heroBanner.entity';
import { HeroBannerService } from '../../services/heroBanner.service';

@ApiTags('CMS#Banner')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/hero-banners')
export class HeroBannerWebController {
  constructor(private readonly service: HeroBannerService) { }

  RELATIONS: FindOptionsRelations<HeroBanner> = {};

  @CacheKey('hero_banners:lists')
  @CacheTTL(10800) // 10800 seconds = 3 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get()
  async findAll(
    @Query() query: HeroBannerFilterDTO,
  ): Promise<SuccessResponse<HeroBanner[]>> {
    query['sortBy'] = 'position'
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }
}
