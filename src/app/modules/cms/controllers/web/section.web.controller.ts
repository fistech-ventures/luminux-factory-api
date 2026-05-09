import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { SectionFilterDTO } from '../../dtos/section/filter.dto';
import { Section } from '../../entities/section.entity';
import { SectionService } from '../../services/section.service';

@ApiTags('CMS#Section')
@ApiBearerAuth()
// @UseInterceptors(WebRequestInterceptor)
@Controller('web/sections')
export class SectionWebController {
  constructor(private readonly service: SectionService) { }

  RELATIONS: FindOptionsRelations<Section> = { items: { product: true, media: true, genre: true, author: true, category: true } };

  @Public()
  @Get()
  async findAll(
    @Query() query: SectionFilterDTO,
  ): Promise<SuccessResponse<Section[]>> {
    query['isActive'] = true;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }
}
