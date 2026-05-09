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
import { FindOptionsRelations } from 'typeorm';
import { PanelTrainingCreateDTO, PanelTrainingFilterDTO, PanelTrainingUpdateDTO } from '../../dtos';
import { PanelTraining } from '../../entities/panelTraining.entity';
import { PanelTrainingService } from '../../services/panelTraining.service';

@ApiTags('Support#Panel Training')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/panel-trainings')
export class PanelTrainingInternalController {
  constructor(private readonly service: PanelTrainingService) { }
  RELATIONS: FindOptionsRelations<PanelTraining> = {};

  @Get()
  async findAll(
    @Query() query: PanelTrainingFilterDTO,
  ): Promise<SuccessResponse | PanelTraining[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PanelTraining> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: PanelTrainingCreateDTO): Promise<PanelTraining> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: PanelTrainingUpdateDTO,
  ): Promise<PanelTraining> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
