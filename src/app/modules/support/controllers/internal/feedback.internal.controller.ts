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
import { FeedbackCreateDTO } from '../../dtos/feedback/create.dto';
import { FeedbackFilterDTO } from '../../dtos/feedback/filter.dto';
import { FeedbackUpdateDTO } from '../../dtos/feedback/update.dto';
import { Feedback } from '../../entities/feedback.entity';
import { FeedbackService } from '../../services/feedback.service';

@ApiTags('Support#Feedback')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/feedbacks')
export class FeedbackInternalController {
  constructor(private readonly service: FeedbackService) { }
  RELATIONS: FindOptionsRelations<Feedback> = {};

  @Get()
  async findAll(@Query() query: FeedbackFilterDTO): Promise<SuccessResponse | Feedback[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Feedback> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: FeedbackCreateDTO): Promise<Feedback> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() body: FeedbackUpdateDTO): Promise<Feedback> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }
}
