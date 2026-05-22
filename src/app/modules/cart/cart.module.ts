import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.entity';
import { CartService } from './services/cart.service';
import { CartWebController } from './controllers/web/cart.web.controller';
import { CartInternalController } from './controllers/internal/cart.internal.controller';

const entities = [Cart, CartItem];
const services = [CartService];
const subscribers = [];
const webControllers = [CartWebController];
const internalControllers = [CartInternalController];
const modules = [UserModule, forwardRef(() => ProductModule)];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...internalControllers, ...webControllers],
})
export class CartModule {}
