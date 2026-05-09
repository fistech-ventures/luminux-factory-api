import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { ProductQuestionCreateDTO } from '../../dtos/productQuestion/create.dto';
import { ProductQuestionFilterDTO } from '../../dtos/productQuestion/filter.dto';
import { ProductQuestionUpdateDTO } from '../../dtos/productQuestion/update.dto';
import { ProductQuestionAnswerCreateDTO } from '../../dtos/productQuestionAnswer/create.dto';
import { ProductQuestionAnswerUpdateDTO } from '../../dtos/productQuestionAnswer/update.dto';
import { ProductQuestion } from '../../entities/productQuestion.entity';
import { ProductQuestionAnswer } from '../../entities/productQuestionAnswer.entity';
import { ProductQuestionService } from '../../services/productQuestion.service';
import { ProductQuestionAnswerService } from '../../services/productQuestionAnswer.service';

@ApiTags('Product Question')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/product-questions')
export class ProductQuestionInternalController {
  constructor(private readonly service: ProductQuestionService,
    private readonly productQuestionAnswerService: ProductQuestionAnswerService) { }
  RELATIONS: FindOptionsRelations<ProductQuestion> = { answer: true };

  @Get()
  async findAll(@Query() query: ProductQuestionFilterDTO): Promise<SuccessResponse<ProductQuestion[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductQuestion> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: ProductQuestionCreateDTO): Promise<ProductQuestion> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Post(':id/answer')
  async createAnswer(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductQuestionAnswerCreateDTO
  ): Promise<ProductQuestionAnswer> {
    body['questionId'] = id;
    return this.productQuestionAnswerService.createOneBase(body);
  }

  @Patch(':id/answer')
  async updateAnswer(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductQuestionAnswerUpdateDTO): Promise<any> {
    await this.productQuestionAnswerService.repo.update({ questionId: id }, body);
    return this.service.findByIdBase(id)
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductQuestionUpdateDTO,
  ): Promise<ProductQuestion> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}