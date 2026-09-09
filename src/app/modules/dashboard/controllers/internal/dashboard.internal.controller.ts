import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import {
  DashboardService,
  IDashboardStatsResponse,
} from '../../services/dashboard.service';
import { DashboardQueryDTO } from '../../dtos/dashboard-query.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/dashboard')
export class DashboardInternalController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardStats(@Query() query: DashboardQueryDTO): Promise<IDashboardStatsResponse> {
    return await this.dashboardService.getDashboardStats(query);
  }
}