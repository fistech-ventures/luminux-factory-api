import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { TransactionSourceCreateDTO } from '../../dtos/transactionSOurce/create.dto';
import { TransactionSourceFilterDTO } from '../../dtos/transactionSOurce/filter.dto';
import { TransactionSourceUpdateDTO } from '../../dtos/transactionSOurce/update.dto';
import { TransactionSource } from '../../entities/transactionSource.entity';
import { TransactionSourceService } from '../../services/transactionSource.service';

@ApiTags('Transaction Source')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/transaction-sources')
export class TransactionSourceInternalController {
  constructor(private readonly service: TransactionSourceService) { }
  RELATIONS: FindOptionsRelations<TransactionSource> = {};

  @Get()
  async findAll(@Query() query: TransactionSourceFilterDTO): Promise<SuccessResponse<TransactionSource[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<TransactionSource> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: TransactionSourceCreateDTO): Promise<TransactionSource> {
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: TransactionSourceUpdateDTO,
  ): Promise<TransactionSource> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }
}