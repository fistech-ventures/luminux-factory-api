import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { VariantCreateDTO } from '../../dtos/variant/create.dto';
import { VariantFilterDTO } from '../../dtos/variant/filter.dto';
import { VariantUpdateDTO } from '../../dtos/variant/update.dto';
import { Variant } from '../../entities/variant.entity';
import { VariantService } from '../../services/variant.service';

@ApiTags('Variant')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/variants')
export class VariantInternalController {
  constructor(private readonly service: VariantService) { }
  RELATIONS: FindOptionsRelations<Variant> = { options: true };

  @Get()
  async findAll(@Query() query: VariantFilterDTO): Promise<SuccessResponse<Variant[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Variant> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: VariantCreateDTO): Promise<Variant> {
    return this.service.createOne(body);
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: VariantUpdateDTO,
  ): Promise<Variant> {
    return this.service.updateOne(id, body);
  }
}