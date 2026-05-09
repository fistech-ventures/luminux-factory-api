import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
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
  @CacheKey('global_configs:system')
  @CacheTTL(10800) // 10800 seconds = 6 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get('system')
  async find(): Promise<GlobalConfig> {
    return this.service.getConfig();
  }

  @CacheKey('global_configs:analytics')
  @CacheTTL(10800) // 10800 seconds = 6 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get('analytics')
  async findAnalyticsConfig(): Promise<AnalyticsConfig> {
    return this.service.getAnalyticsConfig();
  }
}
