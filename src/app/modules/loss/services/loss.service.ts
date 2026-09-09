import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '@src/app/types';
import { ProfitFilterDTO } from '../../profit/dtos/filter.dto';
import {
  ILossStats,
  IProfitEntry,
  ProfitService,
} from '../../profit/services/profit.service';

@Injectable()
export class LossService {
  constructor(private readonly profitService: ProfitService) {}

  async getLossList(filters: ProfitFilterDTO): Promise<SuccessResponse<IProfitEntry[]>> {
    return await this.profitService.getLossList(filters);
  }

  async getLossStats(filters: ProfitFilterDTO): Promise<ILossStats> {
    return await this.profitService.getLossStats(filters);
  }
}