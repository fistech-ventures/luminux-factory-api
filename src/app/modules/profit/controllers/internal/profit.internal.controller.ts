import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import {
  IProfitEntry,
  IProfitStats,
  ProfitService,
} from '../../services/profit.service';
import { ProfitFilterDTO } from '../../dtos/filter.dto';
import dayjs from 'dayjs';

@ApiTags('Profit')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/profit')
export class ProfitInternalController {
  constructor(private readonly profitService: ProfitService) {}

  @Get()
  async getProfitList(@Query() query: ProfitFilterDTO): Promise<SuccessResponse<IProfitEntry[]>> {
    return await this.profitService.getProfitList(this.withDefaultCurrentMonth(query));
  }

  @Get('stats')
  async getProfitStats(@Query() query: ProfitFilterDTO): Promise<IProfitStats> {
    return await this.profitService.getProfitStats(this.withDefaultCurrentMonth(query));
  }

  private withDefaultCurrentMonth(query: ProfitFilterDTO): ProfitFilterDTO {
    if (query.startDate || query.endDate) return query;

    const today = dayjs();
    return {
      ...query,
      startDate: today.startOf('month').format('YYYY-MM-DD'),
      endDate: today.format('YYYY-MM-DD'),
    };
  }
}