import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { FindOptionsRelations } from 'typeorm';
import { AnalyticsConfig } from '../../entities/analyticsConfig.entity';
import { GlobalConfig } from '../../entities/globalConfig.entity';
import { GlobalConfigService } from '../../services/globalConfig.service';

@ApiTags('GlobalConfig')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/global-configs')
export class GlobalConfigWebController {
  constructor(private readonly service: GlobalConfigService) { }

  RELATIONS: FindOptionsRelations<GlobalConfig> = {};

  @Public()
  @Get('system')
  async find(): Promise<GlobalConfig> {
    return this.service.getConfig();
  }

  @Public()
  @Get('analytics')
  async findAnalyticsConfig(): Promise<AnalyticsConfig> {
    return this.service.getAnalyticsConfig();
  }
}
