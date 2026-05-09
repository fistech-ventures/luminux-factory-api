import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { FindOptionsRelations } from 'typeorm';
import { Page } from '../../entities/page.entity';
import { PageService } from '../../services/page.service';
import { SuccessResponse } from '@src/app/types';
import { PageFilterDTO } from '../../dtos/page/filter.dto';

@ApiTags('CMS#Page')
@ApiBearerAuth()
@Controller('web/pages')
export class PageWebController {
  constructor(private readonly service: PageService) { }

  RELATIONS: FindOptionsRelations<Page> = { sections: { section: { items: { product: true, media: true, author: true, category: true, genre: true } } } };

  @Public()
  @Get()
  async findAll(
    @Query() query: PageFilterDTO,
  ): Promise<SuccessResponse<Page[]>> {
    return this.service.findAllBase(query);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Page> {
    return this.service.findByIdBase(id, {
      relations: this.RELATIONS, select: {
        id: true,
        title: true,
        slug: true,
        contentType: true,
        sections: true
      }
    });
  }
}
