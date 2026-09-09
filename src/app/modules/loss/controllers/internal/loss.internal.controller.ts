import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/app/types';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { LossService } from '../../services/loss.service';
import { ProfitFilterDTO } from '../../../profit/dtos/filter.dto';
import { ILossStats, IProfitEntry } from '../../../profit/services/profit.service';

@ApiTags('Loss')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/loss')
export class LossInternalController {
  constructor(private readonly lossService: LossService) {}

  @Get()
  async getLossList(@Query() query: ProfitFilterDTO): Promise<SuccessResponse<IProfitEntry[]>> {
    return await this.lossService.getLossList(query);
  }

  @Get('stats')
  async getLossStats(@Query() query: ProfitFilterDTO): Promise<ILossStats> {
    return await this.lossService.getLossStats(query);
  }
}