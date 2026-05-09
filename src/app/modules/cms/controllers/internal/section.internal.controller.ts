import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { SectionCreateDTO } from '../../dtos/section/create.dto';
import { SectionFilterDTO } from '../../dtos/section/filter.dto';
import { SectionUpdateDTO } from '../../dtos/section/update.dto';
import { Section } from '../../entities/section.entity';
import { SectionService } from '../../services/section.service';

@ApiTags('CMS#Section')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/sections')
export class SectionInternalController {
  constructor(private readonly service: SectionService) { }

  RELATIONS: FindOptionsRelations<Section> = {};

  @Get()
  async findAll(
    @Query() query: SectionFilterDTO,
  ): Promise<SuccessResponse<Section[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Section> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: SectionCreateDTO): Promise<Section> {
    return this.service.createOne(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: SectionUpdateDTO,
  ): Promise<Section> {
    return this.service.updateOne(id, body, { relations: this.RELATIONS });
  }
}
