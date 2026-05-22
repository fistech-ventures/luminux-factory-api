import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { DataSource, Repository } from 'typeorm';
import { UserWishlist } from '../entities/userWishlist.entity';
import { GuestWishlistMergeDTO } from '../dtos/userWishlist/guest-wishlist.dto';

@Injectable()
export class UserWishlistService extends BaseService<UserWishlist> {
  constructor(
    @InjectRepository(UserWishlist)
    public readonly userWishlistRepository: Repository<UserWishlist>,
    private readonly dataSource: DataSource,
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

  async mergeGuestWishlistToUserWishlist(
    guestWishlistItems: GuestWishlistMergeDTO,
    authUser: IAuthUser,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!guestWishlistItems?.guestWishlistItems?.length) {
        await queryRunner.commitTransaction();
        return this.userWishlistRepository.find({
          where: { userId: authUser.id },
          relations: { product: true },
        });
      }

      const userId = authUser.id;

      // Process each guest wishlist item
      for (const guestItem of guestWishlistItems.guestWishlistItems) {
        if (!guestItem?.productId) {
          continue; // Skip invalid items
        }

        // Check if item already exists in user wishlist
        const existing = await queryRunner.manager.exists(UserWishlist, {
          where: { userId, productId: guestItem.productId },
        });

        if (!existing) {
          // Add to wishlist if not already present
          await queryRunner.manager.save(UserWishlist, {
            userId,
            productId: guestItem.productId,
          });
        }
      }

      await queryRunner.commitTransaction();
      return this.userWishlistRepository.find({
        where: { userId },
        relations: { product: true },
      });
    } catch (error) {
      console.error('Wishlist Merge Transaction Failed: ', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
