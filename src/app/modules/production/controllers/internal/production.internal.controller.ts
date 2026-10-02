import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { CreateProductionDTO } from '../../dtos/create.dto';
import { Production } from '../../entities/production.entity';
import { ProductionService } from '../../services/production.service';

@ApiTags('Production')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/productions')
export class ProductionInternalController {
  constructor(private readonly service: ProductionService) {}

  @Get()
  async findAll(@Query() query: any): Promise<SuccessResponse<Production[]>> {
    return this.service.findAllBase(query, { relations: this.service.RELATIONS });
  }

  @Post()
  async create(@Body() body: CreateProductionDTO): Promise<Production> {
    return this.service.createProduction(body);
  }
}