import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { RawMaterialCreateDTO } from '../../dtos/create.dto';
import { RawMaterialFilterDTO } from '../../dtos/filter.dto';
import { RawMaterial } from '../../entities/rawMaterial.entity';
import { RawMaterialService } from '../../services/rawMaterial.service';

@ApiTags('Raw Materials')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/raw-materials')
export class RawMaterialInternalController {
  constructor(private readonly service: RawMaterialService) {}

  @Get()
  async findAll(@Query() query: RawMaterialFilterDTO): Promise<SuccessResponse<RawMaterial[]>> {
    return this.service.findAllBase(query, { relations: this.service.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<RawMaterial> {
    return this.service.findByIdBase(id, { relations: this.service.RELATIONS });
  }

  @Post()
  async create(@Body() body: RawMaterialCreateDTO): Promise<RawMaterial> {
    return this.service.createRawMaterial(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<RawMaterialCreateDTO>,
  ): Promise<RawMaterial> {
    return this.service.updateRawMaterial(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}