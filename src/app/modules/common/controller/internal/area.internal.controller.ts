import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { AreaCreateDTO, AreaFilterDTO, AreaUpdateDTO } from '../../dtos';
import { Area } from '../../entities/area.entity';
import { AreaService } from '../../services/area.service';
import { SortOrder } from '@src/app/base';

@ApiTags('Address#Area')
@ApiBearerAuth()
@Controller('internal/areas')
export class AreaInternalController {
  constructor(private readonly service: AreaService) { }
  RELATIONS: FindOptionsRelations<Area> = { deliveryCharge: true };

  @Get()
  async findAll(
    @Query() query: AreaFilterDTO
  ): Promise<SuccessResponse | Area[]> {
    query['sortBy'] = 'title';
    query['sortOrder'] = SortOrder.ASC;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Area> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: AreaCreateDTO): Promise<Area> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: AreaUpdateDTO
  ): Promise<Area> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
