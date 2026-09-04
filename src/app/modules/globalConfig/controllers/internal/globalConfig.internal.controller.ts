import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindOptionsRelations } from 'typeorm';
import { UpdateAnalyticsConfigDTO, UpdateGlobalConfigDTO } from '../../dtos/globalConfig/update.dto';
import { AnalyticsConfig } from '../../entities/analyticsConfig.entity';
import { GlobalConfig } from '../../entities/globalConfig.entity';
import { GlobalConfigService } from '../../services/globalConfig.service';

@ApiTags('GlobalConfig')
@ApiBearerAuth()
@Controller('internal/global-configs')
export class GlobalConfigInternalController {
  constructor(private readonly service: GlobalConfigService) { }

  RELATIONS: FindOptionsRelations<GlobalConfig> = {};

  @Get('system')
  async find(): Promise<GlobalConfig> {
    return this.service.getConfig();
  }

  @Get('analytics')
  async findAnalyticsConfig(): Promise<AnalyticsConfig> {
    return this.service.getAnalyticsConfig();
  }

  @Patch('system')
  async updateOne(@Body() body: UpdateGlobalConfigDTO): Promise<GlobalConfig> {
    return await this.service.update(body);
  }

  @Patch('analytics')
  async updateAnalyticsConfig(@Body() body: UpdateAnalyticsConfigDTO): Promise<AnalyticsConfig> {
    return await this.service.updateAnalyticsConfig(body);
  }
}
