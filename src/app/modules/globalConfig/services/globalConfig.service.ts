import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAnalyticsConfigDTO, UpdateGlobalConfigDTO } from '../dtos/globalConfig/update.dto';
import { AnalyticsConfig } from '../entities/analyticsConfig.entity';
import { GlobalConfig } from '../entities/globalConfig.entity';

@Injectable()
export class GlobalConfigService {
  constructor(
    @InjectRepository(GlobalConfig)
    private readonly globalConfigRepo: Repository<GlobalConfig>,
    @InjectRepository(AnalyticsConfig)
    private readonly analyticsConfigRepo: Repository<AnalyticsConfig>,
  ) { }

  async getConfig(): Promise<GlobalConfig> {
    const config = await this.globalConfigRepo.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    if (!config) {
      throw new NotFoundException(
        'Configuration parameters are missing. Please check configurations !!!',
      );
    }
    return config;
  }

  async update(data: UpdateGlobalConfigDTO): Promise<GlobalConfig> {
    const config = await this.getConfig();
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    return this.globalConfigRepo.save({ id: config.id, ...data });
  }

  async getAnalyticsConfig(): Promise<AnalyticsConfig> {
    const config = await this.analyticsConfigRepo.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    if (!config) {
      throw new NotFoundException(
        'Configuration parameters are missing. Please check configurations !!!',
      );
    }
    return config;
  }

  async updateAnalyticsConfig(data: UpdateAnalyticsConfigDTO): Promise<AnalyticsConfig> {
    const config = await this.getAnalyticsConfig();
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }
    return this.analyticsConfigRepo.save({ id: config.id, ...data });
  }
}
