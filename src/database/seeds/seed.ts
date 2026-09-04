import { Role } from '@src/app/modules/acl/entities/role.entity';
import { AnalyticsConfig } from '@src/app/modules/globalConfig/entities/analyticsConfig.entity';
import { GlobalConfig } from '@src/app/modules/globalConfig/entities/globalConfig.entity';
import { User } from '@src/app/modules/user/entities/user.entity';
import { UserRole } from '@src/app/modules/user/entities/userRole.entity';
import { ENV, ormConfig } from '@src/env';
import { DataSource } from 'typeorm';
import AnalyticsConfigSeeder from './seeder/analyticsConfig.seeder';
import GlobalConfigSeeder from './seeder/globalConfig.seeder';
import RoleSeeder from './seeder/role.seeder';
import UserSeeder from './seeder/user.seeder';
import { Permission } from '@src/app/modules/acl/entities/permission.entity';
import { RolePermission } from '@src/app/modules/acl/entities/rolePermission.entity';
import { PermissionType } from '@src/app/modules/acl/entities/permissionType.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: ormConfig.host,
  port: ormConfig.port,
  username: ormConfig.username,
  password: ormConfig.password,
  database: ormConfig.database,
  // ssl: ENV.isProduction ? { rejectUnauthorized: false } : false,
  synchronize: ENV.db.synchronize,
  entities: [
    User,
    Role,
    UserRole,
    Permission,
    PermissionType,
    RolePermission,
    GlobalConfig,
    AnalyticsConfig,
  ],
});

(async () => {
  await dataSource.initialize();
  await dataSource.synchronize();

  const roleSeeder = new RoleSeeder(dataSource);
  const userSeeder = new UserSeeder(dataSource);
  const globalConfigSeeder = new GlobalConfigSeeder(dataSource);
  const analyticsConfigSeeder = new AnalyticsConfigSeeder(dataSource);

  await roleSeeder.run();
  await userSeeder.run();
  await globalConfigSeeder.run();
  await analyticsConfigSeeder.run();
  await dataSource.destroy();
})();
