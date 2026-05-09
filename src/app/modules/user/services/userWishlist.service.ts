import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { Repository } from 'typeorm';
import { UserWishlist } from '../entities/userWishlist.entity';

@Injectable()
export class UserWishlistService extends BaseService<UserWishlist> {
  constructor(
    @InjectRepository(UserWishlist)
    public readonly userWishlistRepository: Repository<UserWishlist>,
  ) {
    super(userWishlistRepository);
  }

  async wishlist(body: UserWishlist, authUser: IAuthUser): Promise<SuccessResponse> {
    const { productId } = body;
    const userId = authUser.id;

    // Check if already in wishlist
    const existing = await this.userWishlistRepository.exists({
      where: { userId, productId },
    });
    if (existing) {
      // Remove from wishlist
      await this.userWishlistRepository.delete({ userId, productId });
      return new SuccessResponse('Removed from wishlist');
    }

    // Add to wishlist
    await this.createOneBase({ userId, productId });
    return new SuccessResponse('Added to wishlist');
  }
}
