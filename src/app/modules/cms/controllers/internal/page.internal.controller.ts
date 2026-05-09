import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { PageCreateDTO } from '../../dtos/page/create.dto';
import { PageFilterDTO } from '../../dtos/page/filter.dto';
import { PageUpdateDTO } from '../../dtos/page/update.dto';
import { Page } from '../../entities/page.entity';
import { PageService } from '../../services/page.service';

@ApiTags('CMS#Page')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/pages')
export class PageInternalController {
  constructor(private readonly service: PageService) { }

  RELATIONS: FindOptionsRelations<Page> = { sections: { section: { items: { product: true } } } };

  @Get()
  async findAll(
    @Query() query: PageFilterDTO,
  ): Promise<SuccessResponse<Page[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Page> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: PageCreateDTO): Promise<Page> {
    return this.service.createOne(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: PageUpdateDTO,
  ): Promise<Page> {
    return this.service.updateOne(id, body, { relations: this.RELATIONS });
  }
}
