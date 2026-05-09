import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { SuccessResponse } from '@src/app/types';
import { Between } from 'typeorm';
import { FilterTransactionDTO } from '../../dtos';
import { ApproveTransactionDTO } from '../../dtos/transaction/approve.dto';
import { UserTransaction } from '../../entities/userTransaction.entity';
import { UserTransactionService } from '../../services/userTransaction.service';

@ApiTags('User Transaction')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/user-transactions')
export class UserTransactionInternalController {
  constructor(private readonly service: UserTransactionService) { }

  RELATIONS = {};

  @Get()
  async findAll(@Query() query: FilterTransactionDTO): Promise<SuccessResponse<UserTransaction[]>> {
    if (query?.startDate && query?.endDate) {
      query['createdAt'] = Between(query?.startDate, query?.endDate);
    }
    delete query?.startDate;
    delete query?.endDate;

    return this.service.findAll(query, { relations: this.RELATIONS });
  }

  @Public()
  @Get('by-code/:code')
  async findUserTransactionByCode(@Param('code') code: string): Promise<UserTransaction> {
    return this.service.findOneBase({ code });
  }

  @Post('approve')
  async approveTransactions(
    @Body() body: ApproveTransactionDTO,
  ): Promise<Partial<UserTransaction>[]> {
    return this.service.approveTransactions(body);
  }
}
