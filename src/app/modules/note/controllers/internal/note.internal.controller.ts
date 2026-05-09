import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { NoteCreateDTO } from '../../dtos/create.dto';
import { NoteFilterDTO } from '../../dtos/filter.dto';
import { NoteUpdateDTO } from '../../dtos/update.dto';
import { Note } from '../../entities/note.entity';
import { NoteService } from '../../services/note.service';

@ApiTags('Note')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/notes')
export class NoteInternalController {
  constructor(private readonly service: NoteService) { }

  RELATIONS: FindOptionsRelations<Note> = {};

  @Get()
  async findAll(
    @Query() query: NoteFilterDTO,
  ): Promise<SuccessResponse<Note[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Note> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: NoteCreateDTO): Promise<Note> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: NoteUpdateDTO,
  ): Promise<Note> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
