import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { UserTransaction } from '../../entities/userTransaction.entity';
import { UserTransactionService } from '../../services/userTransaction.service';

@ApiTags('User Transaction')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/user-transactions')
export class UserTransactionWebController {
  constructor(private readonly service: UserTransactionService) { }

  RELATIONS: FindOptionsRelations<UserTransaction> = { userInvoice: true };

  @Get('by-code/:code')
  async findByCode(@Param('code') code: string): Promise<UserTransaction> {
    return this.service.findOneBase({ code });
  }
}
