import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { CreateProductionDTO } from '../../dtos/create.dto';
import { UpdateProductionDTO } from '../../dtos/update.dto';
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Production> {
    return this.service.findByIdBase(id, { relations: this.service.RELATIONS });
  }

  @Post()
  async create(@Body() body: CreateProductionDTO): Promise<Production> {
    return this.service.createProduction(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductionDTO): Promise<Production> {
    return this.service.updateProduction(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}