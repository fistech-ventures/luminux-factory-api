import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '@src/app/decorators/publicRoute.decorator';
import { SuccessResponse } from '@src/app/types';
import { CreateFormSubmitDTO } from '../../dtos/formSubmits/create.dto';
import { FilterFormSubmitDTO } from '../../dtos/formSubmits/filter.dto';
import { FormSubmit } from '../../entities/formSubmits.entity';
import { FormSubmitService } from '../../services/formSubmit.service';

@ApiTags('Form Submit')
@ApiBearerAuth()
@Controller('web/form-submits')
export class WebFormSubmitController {
  constructor(private readonly service: FormSubmitService) { }
  RELATIONS = {};

  @Public()
  @Get()
  async findAll(@Query() query: FilterFormSubmitDTO): Promise<SuccessResponse | FormSubmit[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  // @Get(':id')
  // async findById(@Param('id') id: number): Promise<FormSubmit> {
  //   return this.service.findByIdBase(id, { relations: this.RELATIONS });
  // }

  @Public()
  // @LimitFingerprintSubmissions()
  @Post()
  async createOne(@Body() body: CreateFormSubmitDTO): Promise<FormSubmit> {
    return this.service.createOneBase(body);
  }

  // @Patch(':id')
  // async updateOne(@Param('id') id: number, @Body() body: UpdateFormSubmitDTO): Promise<FormSubmit> {
  //   return this.service.updateOneBase(id, body);
  // }

  // @Delete(':id')
  // async deleteOne(@Param('id') id: number): Promise<SuccessResponse> {
  //   return this.service.deleteOneBase(id);
  // }
}
