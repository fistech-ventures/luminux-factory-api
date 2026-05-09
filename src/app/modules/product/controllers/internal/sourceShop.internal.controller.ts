import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { SourceShopCreateDTO } from '../../dtos/sourceShop/create.dto';
import { SourceShopFilterDTO } from '../../dtos/sourceShop/filter.dto';
import { SourceShopUpdateDTO } from '../../dtos/sourceShop/update.dto';
import { SourceShop } from '../../entities/sourceShop.entity';
import { SourceShopService } from '../../services/sourceShop.service';

@ApiTags('Source Shop')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/source-shops')
export class SourceShopInternalController {
  constructor(private readonly service: SourceShopService) { }
  RELATIONS: FindOptionsRelations<SourceShop> = {};

  @Get()
  async findAll(@Query() query: SourceShopFilterDTO): Promise<SuccessResponse<SourceShop[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<SourceShop> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: SourceShopCreateDTO): Promise<SourceShop> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: SourceShopUpdateDTO,
  ): Promise<SourceShop> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}