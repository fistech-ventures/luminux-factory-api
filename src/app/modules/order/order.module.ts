import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ProductModule } from '../product/product.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { OrderInternalController } from './controllers/internal/order.internal.controller';
import { OrderWebController } from './controllers/web/order.web.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { OrderStatus } from './entities/orderStatus.entity';
import { OrderService } from './services/order.service';
import { OrderItemService } from './services/orderItem.service';
import { OrderStatusService } from './services/orderStatus.service';

const entities = [Order, OrderItem, OrderStatus];
const services = [OrderService, OrderItemService, OrderStatusService];
const subscribers = [];
const internalControllers = [OrderInternalController];
const webControllers = [OrderWebController];
const modules = [
  forwardRef(() => ProductModule),
  UserModule,
  CommonModule,
  TransactionModule,
  forwardRef(() => AuthModule)
];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...internalControllers, ...webControllers],
})
export class OrderModule { }
