import { Body, Controller, Get, NotFoundException, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { IAuthUser } from '@src/app/interfaces';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { FindOptionsRelations } from 'typeorm';
import { CartManageDTO } from '../../dtos/cart/create.dto';
import { Cart } from '../../entities/cart.entity';
import { CartService } from '../../services/cart.service';

@ApiTags('Cart')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/carts')
export class CartInternalController {
  constructor(private readonly service: CartService) { }

  RELATIONS: FindOptionsRelations<Cart> = {};

  @Get("active/:userId")
  async activeCartByUserId(@Param("userId", UuidValidationPipe) userId: string): Promise<any> {
    return await this.service.activeCartByUserId(userId);
  }

  @Post()
  async updateCartWithTransaction(
    @Body() data: CartManageDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<any> {
    if (!data?.customerId) throw new NotFoundException('Customer data not found!')
    return this.service.updateCartWithTransaction(data, authUser);
  }
}
