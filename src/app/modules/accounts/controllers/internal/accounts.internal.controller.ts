import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccountsService,
  IAccountBalancesResponse,
  IAccountTransactionsResponse,
} from '../../services/accounts.service';
import { AccountTransactionFilterDTO } from '../../dtos/transaction-filter.dto';
import { InternalRequestInterceptor } from '@src/app/interceptors';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/accounts')
export class AccountsInternalController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('balances')
  async getBalances(): Promise<IAccountBalancesResponse> {
    return await this.accountsService.getAccountBalances();
  }

  @Get('transactions')
  async getTransactions(@Query() query: AccountTransactionFilterDTO): Promise<IAccountTransactionsResponse> {
    return await this.accountsService.getTransactions(query);
  }
}