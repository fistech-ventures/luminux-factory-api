import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { QuoteCreateDTO } from '../../dtos/quote/create.dto';
import { FilterQuoteDTO } from '../../dtos/quote/filter.dto';
import { QuoteUpdateDTO } from '../../dtos/quote/update.dto';
import { Quote } from '../../entities/quote.entity';
import { QuoteService } from '../../services/quote.service';

@ApiTags('Book#Quote')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/quotes')
export class QuoteInternalController {
  constructor(private readonly service: QuoteService) { }
  RELATIONS: FindOptionsRelations<Quote> = {};

  @Get()
  async findAll(@Query() query: FilterQuoteDTO): Promise<SuccessResponse<Quote[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Quote> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: QuoteCreateDTO): Promise<Quote> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: QuoteUpdateDTO,
  ): Promise<Quote> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}
