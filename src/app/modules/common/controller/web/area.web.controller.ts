import {
  Controller,
  Get,
  Param,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { AreaFilterDTO } from '../../dtos';
import { Area } from '../../entities/area.entity';
import { AreaService } from '../../services/area.service';
import { SortOrder } from '@src/app/base';

@ApiTags('Address#Area')
@ApiBearerAuth()
@Controller('web/areas')
export class AreaWebController {
  constructor(private readonly service: AreaService) { }
  RELATIONS: FindOptionsRelations<Area> = { deliveryCharge: true };

  @Public()
  @Get()
  async findAll(
    @Query() query: AreaFilterDTO
  ): Promise<SuccessResponse | Area[]> {
    query['sortBy'] = 'title';
    query['sortOrder'] = SortOrder.ASC;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Area> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }
}
