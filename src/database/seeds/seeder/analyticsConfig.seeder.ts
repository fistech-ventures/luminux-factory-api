import { AnalyticsConfig } from '@src/app/modules/globalConfig/entities/analyticsConfig.entity';
import { DataSource } from 'typeorm';

export default class AnalyticsConfigSeeder {
  constructor(private readonly dataSource: DataSource) { }

  public async run(): Promise<void> {
    const analyticsConfig = await this.dataSource.manager.find(AnalyticsConfig);
    if (analyticsConfig.length <= 0) {
      await this.dataSource.manager.save(AnalyticsConfig, {
        trackingScripts: [],
      } satisfies AnalyticsConfig);
    }
  }
}
