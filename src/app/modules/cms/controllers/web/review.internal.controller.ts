import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ReviewFilterDTO } from '../../dtos/review/filter.dto';
import { Review } from '../../entities/review.entity';
import { ReviewService } from '../../services/review.service';

@ApiTags('CMS#Review')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/reviews')
export class ReviewWebController {
  constructor(
    private readonly service: ReviewService,
  ) { }
  RELATIONS: FindOptionsRelations<Review> = {};

  @Public()
  @Get()
  async findAll(@Query() query: ReviewFilterDTO): Promise<SuccessResponse<Review[]>> {
    query['isActive'] = true;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }
}