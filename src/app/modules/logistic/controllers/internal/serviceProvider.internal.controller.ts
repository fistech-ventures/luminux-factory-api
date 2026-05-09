import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ServiceProviderCreateDTO } from '../../dtos/create.dto';
import { ServiceProviderFilterDTO } from '../../dtos/filter.dto';
import { ServiceProviderUpdateDTO } from '../../dtos/update.dto';
import { ServiceProvider } from '../../entities/serviceProvider.entity';
import { ServiceProviderService } from '../../services/serviceProvider.service';

@ApiTags('Logistic')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/service-providers')
export class ServiceProviderInternalController {
  constructor(private readonly service: ServiceProviderService) { }

  RELATIONS: FindOptionsRelations<ServiceProvider> = {};

  @Get()
  async findAll(
    @Query() query: ServiceProviderFilterDTO,
  ): Promise<SuccessResponse<ServiceProvider[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ServiceProvider> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: ServiceProviderCreateDTO): Promise<ServiceProvider> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: ServiceProviderUpdateDTO,
  ): Promise<ServiceProvider> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
