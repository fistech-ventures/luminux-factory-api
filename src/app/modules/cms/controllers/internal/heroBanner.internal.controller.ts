import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheRevalidateKeys } from '@src/app/decorators/cacheRevalidate.decorator';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { HeroBannerCreateDTO } from '../../dtos/heroBanner/create.dto';
import { HeroBannerFilterDTO } from '../../dtos/heroBanner/filter.dto';
import { HeroBannerUpdateDTO } from '../../dtos/heroBanner/update.dto';
import { HeroBanner } from '../../entities/heroBanner.entity';
import { HeroBannerService } from '../../services/heroBanner.service';

@ApiTags('CMS#Banner')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/hero-banners')
export class HeroBannerInternalController {
  constructor(private readonly service: HeroBannerService) { }

  RELATIONS: FindOptionsRelations<HeroBanner> = {};

  @Get()
  async findAll(
    @Query() query: HeroBannerFilterDTO,
  ): Promise<SuccessResponse<HeroBanner[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<HeroBanner> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['hero_banners'])
  @UseInterceptors(CacheInterceptor)
  @Post()
  async createOne(@Body() body: HeroBannerCreateDTO): Promise<HeroBanner> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['hero_banners'])
  @UseInterceptors(CacheInterceptor)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: HeroBannerUpdateDTO,
  ): Promise<HeroBanner> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
