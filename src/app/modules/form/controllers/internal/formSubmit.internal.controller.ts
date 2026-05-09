import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { CreateFormSubmitDTO } from '../../dtos/formSubmits/create.dto';
import { FilterFormSubmitDTO } from '../../dtos/formSubmits/filter.dto';
import { UpdateFormSubmitDTO } from '../../dtos/formSubmits/update.dto';
import { FormSubmit } from '../../entities/formSubmits.entity';
import { FormSubmitService } from '../../services/formSubmit.service';

@ApiTags('Form Submit')
@ApiBearerAuth()
@Controller('internal/form-submits')
export class InternalFormSubmitController {
  constructor(private readonly service: FormSubmitService) { }
  RELATIONS = {};

  @Get()
  async findAll(@Query() query: FilterFormSubmitDTO): Promise<SuccessResponse | FormSubmit[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<FormSubmit> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: CreateFormSubmitDTO): Promise<FormSubmit> {
    return this.service.createOneBase(body);
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() body: UpdateFormSubmitDTO): Promise<FormSubmit> {
    return this.service.updateOneBase(id, body);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
