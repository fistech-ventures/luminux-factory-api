import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ReviewCreateDTO } from '../../dtos/review/create.dto';
import { ReviewFilterDTO } from '../../dtos/review/filter.dto';
import { ReviewUpdateDTO } from '../../dtos/review/update.dto';
import { Review } from '../../entities/review.entity';
import { ReviewService } from '../../services/review.service';

@ApiTags('CMS#Review')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/reviews')
export class ReviewInternalController {
  constructor(
    private readonly service: ReviewService,
  ) { }
  RELATIONS: FindOptionsRelations<Review> = {};

  @Get()
  async findAll(@Query() query: ReviewFilterDTO): Promise<SuccessResponse<Review[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Review> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: ReviewCreateDTO): Promise<Review> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ReviewUpdateDTO,
  ): Promise<Review> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}