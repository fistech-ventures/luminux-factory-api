import { Role } from '@src/app/modules/acl/entities/role.entity';
import { Author } from '@src/app/modules/author/entities/author.entity';
import { Area } from '@src/app/modules/common/entities/area.entity';
// import { City } from '@src/app/modules/common/entities/city.entity';
import { DeliveryCharge } from '@src/app/modules/common/entities/deliveryCharge.entity';
import { Quote } from '@src/app/modules/common/entities/quote.entity';
import { AnalyticsConfig } from '@src/app/modules/globalConfig/entities/analyticsConfig.entity';
import { GlobalConfig } from '@src/app/modules/globalConfig/entities/globalConfig.entity';
import { Cart } from '@src/app/modules/cart/entities/cart.entity';
import { CartItem } from '@src/app/modules/cart/entities/cartItem.entity';
import { User } from '@src/app/modules/user/entities/user.entity';
import { UserAddress } from '@src/app/modules/user/entities/userAddress.entity';
import { UserMembership } from '@src/app/modules/user/entities/userMembership.entity';
import { UserRole } from '@src/app/modules/user/entities/userRole.entity';
import { ormConfig } from '@src/env';
import { DataSource } from 'typeorm';
import AnalyticsConfigSeeder from './seeder/analyticsConfig.seeder';
import AreaSeeder from './seeder/area.seeder';
import DeliveryChargeSeeder from './seeder/deliveryCharge.seeder';
import GlobalConfigSeeder from './seeder/globalConfig.seeder';
import RoleSeeder from './seeder/role.seeder';
import UserSeeder from './seeder/user.seeder';

const dataSource = new DataSource({
  type: 'postgres',
  host: ormConfig.host,
  port: ormConfig.port,
  username: ormConfig.username,
  password: ormConfig.password,
  database: ormConfig.database,
  // ssl: ENV.isProduction ? { rejectUnauthorized: false } : false,
  synchronize: true,
  entities: [
    User,
    Role,
    UserRole,
    Author,
    UserMembership,
    Cart,
    CartItem,
    UserAddress,
    Area,
    // City,
    DeliveryCharge,
    Quote,
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
  const deliveryChargeSeeder = new DeliveryChargeSeeder(dataSource);
  const areaSeeder = new AreaSeeder(dataSource);

  await roleSeeder.run();
  await userSeeder.run();
  await globalConfigSeeder.run();
  await deliveryChargeSeeder.run();
  await analyticsConfigSeeder.run();
  await areaSeeder.run();
  await dataSource.destroy();
})();
