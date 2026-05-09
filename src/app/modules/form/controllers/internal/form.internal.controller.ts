import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { CreateFormDTO } from '../../dtos/form/create.dto';
import { UpdateFormDTO } from '../../dtos/form/update.dto';

import { FilterFormDTO } from '../../dtos/form';
import { Form } from '../../entities/form.entity';
import { FormService } from '../../services/form.service';

@ApiTags('Form')
@ApiBearerAuth()
@Controller('internal/forms')
export class InternalFormController {
  constructor(private readonly service: FormService) { }
  RELATIONS = {};

  @Get()
  async findAll(@Query() query: FilterFormDTO): Promise<SuccessResponse | Form[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Form> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: CreateFormDTO): Promise<Form> {
    return this.service.createOneBase(body);
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() body: UpdateFormDTO): Promise<Form> {
    return this.service.updateOneBase(id, body);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
