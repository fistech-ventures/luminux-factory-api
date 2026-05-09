import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { TagCreateDTO } from '../../dtos/tag/create.dto';
import { TagFilterDTO } from '../../dtos/tag/filter.dto';
import { TagUpdateDTO } from '../../dtos/tag/update.dto';
import { Tag } from '../../entities/tag.entity';
import { TagService } from '../../services/tag.service';

@ApiTags('Tag')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/tags')
export class TagInternalController {
  constructor(private readonly service: TagService) { }
  RELATIONS: FindOptionsRelations<Tag> = {};

  @Get()
  async findAll(@Query() query: TagFilterDTO): Promise<SuccessResponse<Tag[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Tag> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: TagCreateDTO): Promise<Tag> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: TagUpdateDTO,
  ): Promise<Tag> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}