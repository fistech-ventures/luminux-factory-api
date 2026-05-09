import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { FindOptionsRelations } from 'typeorm';
import { CartManageDTO } from '../../dtos/cart/create.dto';
import { Cart } from '../../entities/cart.entity';
import { CartService } from '../../services/cart.service';

@ApiTags('Cart')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/carts')

export class CartWebController {
  constructor(private readonly service: CartService) { }

  RELATIONS: FindOptionsRelations<Cart> = {};

  @Get("active")
  async activeCartByUserId(@AuthUser() authUser: IAuthUser): Promise<any> {
    return await this.service.activeCartByUserId(authUser.id);
  }

  @Post()
  async updateCartWithTransaction(
    @Body() data: CartManageDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<any> {
    return this.service.updateCartWithTransaction(data, authUser);
  }
}
