import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { GenreCreateDTO } from '../../dtos/genre/create.dto';
import { GenreFilterDTO } from '../../dtos/genre/filter.dto';
import { GenreUpdateDTO } from '../../dtos/genre/update.dto';
import { Genre } from '../../entities/genre.entity';
import { GenreService } from '../../services/genre.service';

@ApiTags('Genre')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/genres')
export class GenreInternalController {
  constructor(private readonly service: GenreService) { }
  RELATIONS: FindOptionsRelations<Genre> = {};

  @Get()
  async findAll(@Query() query: GenreFilterDTO): Promise<SuccessResponse<Genre[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Genre> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: GenreCreateDTO): Promise<Genre> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: GenreUpdateDTO,
  ): Promise<Genre> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}