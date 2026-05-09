import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { Product } from '@src/app/modules/product/entities/product.entity';
import { SuccessResponse } from '@src/app/types';
import { FindOptionsRelations } from 'typeorm';
import { UserWishlistCreateDTO } from '../../dtos/userWishlist/create.dto';
import { UserWishlist } from '../../entities/userWishlist.entity';
import { UserWishlistService } from '../../services/userWishlist.service';

@ApiTags('User Wishlist')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/user-wishlists')
export class UserWishlistWebController {
  constructor(private readonly service: UserWishlistService) { }
  RELATIONS: FindOptionsRelations<UserWishlist> = {
  };

  @Get()
  async findAll(
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse<Product[]>> {
    const wishlist = await this.service.findAllBase({ userId: authUser.id }, { relations: { product: true } });
    const wishlistedProducts = wishlist.data.map((item) => item.product);
    return new SuccessResponse('Wishlisted products retrieved successfully', wishlistedProducts);
  }

  @Get('ids')
  async findAllBookmarkedProfileIds(
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse> {
    const wishlistedProducts = await this.service.repo.find({ where: { userId: authUser.id }, select: { productId: true } },);
    const wishlistedProductIds = wishlistedProducts.map((wishlist) => wishlist.productId);
    return new SuccessResponse('Wishlisted product IDs retrieved successfully', wishlistedProductIds);
  }

  @Post()
  async createOne(@Body() body: UserWishlistCreateDTO, @AuthUser() authUser: IAuthUser): Promise<SuccessResponse> {
    return this.service.wishlist(body, authUser);
  }
}
