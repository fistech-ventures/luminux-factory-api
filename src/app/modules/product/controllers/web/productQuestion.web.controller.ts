import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ProductQuestionCreateDTO } from '../../dtos/productQuestion/create.dto';
import { ProductQuestionFilterDTO } from '../../dtos/productQuestion/filter.dto';
import { ProductQuestion } from '../../entities/productQuestion.entity';
import { ProductQuestionService } from '../../services/productQuestion.service';

@ApiTags('Product Question')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/product-questions')
export class ProductQuestionWebController {
  constructor(private readonly service: ProductQuestionService) { }
  RELATIONS: FindOptionsRelations<ProductQuestion> = { answer: true };

  @Public()
  @Get()
  async findAll(@Query() query: ProductQuestionFilterDTO): Promise<SuccessResponse<ProductQuestion[]>> {
    // query['status'] = ENUM_PRODUCT_QUESTION_ANSWER_STATUS.PUBLISHED;
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Public()
  @Post()
  async create(@Body() body: ProductQuestionCreateDTO): Promise<ProductQuestion> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }
}