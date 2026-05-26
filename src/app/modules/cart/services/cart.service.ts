import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import dtoToModelMapper from '@src/app/helpers/dtoToModelMapper';
import { IAuthUser } from '@src/app/interfaces';
import { asyncForEach, calculateMaxDiscount } from '@src/shared';
import { DataSource, Repository } from 'typeorm';
import { ProductService } from '../../product/services/product.service';
import { ProductVariantOptionService } from '../../product/services/productVariantOption.service';
import { ENUM_USER_MEMBERSHIP_STATUS } from '../../user/const';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { CartManageDTO } from '../dtos/cart/create.dto';
import { GuestCartMergeDTO } from '../dtos/cart/guest-cart.dto';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cartItem.entity';

@Injectable()
export class CartService extends BaseService<Cart> {
  constructor(
    @InjectRepository(Cart)
    private readonly _repo: Repository<Cart>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => ProductVariantOptionService))
    private readonly productVariantOptionService: ProductVariantOptionService,
  ) {
    super(_repo);
  }

  async activeCartByUserId(
    userId: string,
  ): Promise<any> {
    const userData: User = await this.userService.findByIdBase(userId, { relations: { activeCart: { items: true }, membership: true } });
    if (!userData) {
      throw new BadRequestException("User data not found!");
    }
    const cartData: any = userData?.activeCart;
    if (!cartData) {
      return null
    }
    if (cartData?.items && cartData?.items?.length > 0) {
      await cartData.items.sort(
        (x, y) => x.createdAt - y.createdAt
      );
    }
    cartData.hasMembership = userData?.membership?.status === ENUM_USER_MEMBERSHIP_STATUS.ACTIVE;
    cartData.membershipStatus = userData?.membership?.status ?? null;
    cartData.membershipCode = userData?.membership?.code ?? null;
    cartData.cartSubTotal = 0;
    // const globalSetting: GlobalSetting =
    //   await this.globalSettingService.getOne();
    // if (globalSetting && globalSetting.isVatApplicable == true) {
    //   cartData.cartTotalVat = 0;
    // }
    cartData.cartTotal = 0;
    cartData.cartTotalWithoutDiscount = 0;
    if (cartData?.items?.length) {
      await asyncForEach(
        cartData.items,
        async (item: any, index: number) => {
          if (
            item.product?.discount ||
            (item.product?.campaignItems && item.product?.campaignItems.length)
          ) {
            const discountDetails = await calculateMaxDiscount(
              item.product?.discount,
              // item.product?.campaignItems,
              item.productVariantOption?.mrp
            );

            cartData.items[index].subTotal = 0;
            cartData.items[index].unitDiscountedPrice =
              discountDetails?.discountedPrice;
            cartData.cartSubTotal +=
              cartData.items[index].unitDiscountedPrice * item.quantity ||
              1;
          } else {
            cartData.items[index].unitDiscountedPrice = null;
            if (item.productId) {
              cartData.items[index].subTotal = item.product?.saleAmount * item.quantity;
              cartData.cartSubTotal +=
                item.product?.saleAmount * item.quantity
            } else {
              cartData.items[index].subTotal = item.productVariantOption?.saleAmount * item.quantity;
              cartData.cartSubTotal +=
                item.productVariantOption?.saleAmount * item.quantity || 0;

            }
          }
          // if (globalSetting && globalSetting.isVatApplicable == true) {
          //   cartData.cartTotalVat +=
          //     item.variantOption?.mrpVat * item.quantity || 0;
          // }
          cartData.cartTotalWithoutDiscount +=
            item.productId ? item.product?.saleAmount * item.quantity || 0 :
              item.productVariantOption?.saleAmount * item.quantity || 0;

          //Temp Solution
          //TODO
          // Remove this in future

          // TODO: Integrate OfferResolutionService to apply special offers discounts
          // Import and inject OfferResolutionService from offers module
          // Call offerResolutionService.resolveForItem() for each cart item
          // Apply the returned discount to the cart calculation

          // const vOpt = item.product.variantOptions.filter(
          //   (v) => v.id === item.variantOption.id
          // );

          // if (vOpt.length) item.variantOption = vOpt[0];
        }
      );
    }
    if (cartData.cartTotalWithoutDiscount !== cartData.cartSubTotal) {
      cartData.productDiscount =
        cartData.cartTotalWithoutDiscount - cartData.cartSubTotal;
    }
    cartData.cartTotal = cartData.cartSubTotal || 0;
    cartData.couponDiscount = 0;

    //! Coupon
    // if (cartData.coupon) {
    //   const couponValidityOfUser =
    //     await this.couponService.validateCouponByUser(
    //       cartData.coupon,
    //       userId
    //     );
    //   if (!couponValidityOfUser.valid) {
    //     delete cartData.coupon;
    //     cartData.couponId = null;

    //     await this.repository.save(
    //       dtoToModelMapper(Cart, { id: cartData.id, coupon: null })
    //     );
    //   } else {
    //     if (cartData.coupon.discountType === "fixedAmount") {
    //       cartData.couponDiscount = cartData.coupon.amount;
    //     } else {
    //       cartData.couponDiscount =
    //         (cartData.coupon.amount * couponValidityOfUser.cartTotal) / 100;
    //     }
    //     cartData.cartTotal -= cartData.couponDiscount;
    //   }
    // }

    //! New Feature
    // if (requestClient && requestClient === REQUEST_CLIENT.WEB) {
    //   if (globalSetting.isFeaturedDiscountApplicable) {
    //     if (
    //       cartData.cartTotal >=
    //       globalSetting.featuredDiscountApplicableAmount
    //     ) {
    //       const amount = await calculateDiscountWithPercentageOrFixed(
    //         globalSetting.featuredDiscountType,
    //         cartData.cartTotal,
    //         globalSetting.featuredDiscountAmount
    //       );
    //       cartData.featuredDiscount = Math.round(amount.discountAmount);
    //       cartData.featuredDiscountDetails = {
    //         type: globalSetting.featuredDiscountType,
    //         amount: globalSetting.featuredDiscountAmount,
    //         featuredDiscount: Math.round(amount.discountAmount),
    //       };
    //       cartData.cartTotal = Math.round(amount.totalAmount);
    //     }
    //   }
    //   cartData.isDeliveryChargeApplicable = true;

    //   if (globalSetting.isDeliveryChargeNotApplicable) {
    //     if (
    //       cartData.cartTotal >=
    //       globalSetting.deliveryChargeNotApplicableAmount
    //     ) {
    //       cartData.deliveryDiscount = {
    //         isApplicable: true,
    //         amount: 0,
    //         reason: "Free Delivery Campaign",
    //       };
    //     }
    //   }
    // }

    cartData.cartTotal += cartData.cartTotalVat || 0;
    cartData.cartTotal = Math.round(cartData.cartTotal)
    return cartData;
  }

  async updateCartWithTransaction(
    data: CartManageDTO,
    authUser: IAuthUser,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const action = data?.action ?? 'add'; // default to "add"

      // Determine customer
      const customer = await this.userService.findByIdBase(data?.customerId ? data.customerId : authUser?.id);

      if (!customer?.id) {
        throw new BadRequestException("No Customer data provided!");
      }

      let variantOption: any = null;
      let product: any = null;

      if (!data?.variantOptionId && !data?.productId) {
        throw new BadRequestException("Choose at least one product or variant option!");
      }

      // Identify product/variant
      if (data?.variantOptionId) {
        variantOption = await this.productVariantOptionService.isExist({ id: data.variantOptionId }, {
          relations: { product: true, variant: true, variantOption: true },
        });
        if (!variantOption) {
          throw new NotFoundException(`Variant option with ID ${data.variantOptionId} not found.`);
        }
        product = variantOption.product;
      } else {
        product = await this.productService.isExist({ id: data.productId }, {
          relations: { author: true, translator: true, publication: true },
        });
      }

      if (!product) {
        throw new BadRequestException("Invalid product or variant option!");
      }

      if (!data.quantity && action !== 'remove') {
        data.quantity = 1;
      }

      // Create cart if not exists
      let currentCartId = customer?.activeCartId ?? null;
      if (!currentCartId) {
        const newCart = await queryRunner.manager.save(Cart, { userId: customer.id })
        currentCartId = newCart.id;
      }

      // Check if item is already in the cart
      const whereQuery: any = {
        cartId: currentCartId,
      }
      if (data?.variantOptionId)
        whereQuery.productVariantOptionId = data.variantOptionId
      else if (data?.productId)
        whereQuery.productId = data.productId
      else throw new NotFoundException('Select a product or variant!')
      const existingCartItem = await queryRunner.manager.findOne(CartItem, {
        where: whereQuery,
      });

      // Handle operations
      if (action === 'remove') {
        if (!existingCartItem) {
          throw new NotFoundException("Item not found in cart to remove.");
        }

        await queryRunner.manager.delete(CartItem, { id: existingCartItem.id });

      } else if (action === 'update') {
        if (!existingCartItem) {
          throw new NotFoundException("Item not found in cart to update.");
        }

        const newQuantity = data.quantity;
        if (newQuantity <= 0) {
          await queryRunner.manager.delete(CartItem, { id: existingCartItem.id });
        } else {
          existingCartItem.quantity = newQuantity;
          existingCartItem.product = product
          existingCartItem.productVariantOption = variantOption
          await queryRunner.manager.save(existingCartItem);
        }

      } else {
        // Default: add
        const cartItemData = {
          variantOption: variantOption,
          variantOptionId: variantOption?.id,
          productVariantOptionId: variantOption?.id,
          productVariantOption: variantOption,
          product: product,
          productId: product.id,
          quantity: data.quantity,
          cartId: currentCartId,
          createdBy: authUser,
        };

        if (existingCartItem) {
          cartItemData.quantity += existingCartItem.quantity;
          const updated = {
            id: existingCartItem.id,
            quantity: cartItemData.quantity,
          };
          await queryRunner.manager.save(
            dtoToModelMapper(this.dataSource, CartItem, updated)
          );
        } else {
          await queryRunner.manager.save(
            dtoToModelMapper(this.dataSource, CartItem, cartItemData)
          );
        }
      }
      if (!customer?.activeCartId)
        await queryRunner.manager.save(User, { id: customer.id, activeCartId: currentCartId });

      await queryRunner.commitTransaction();
      return this.activeCartByUserId(customer?.id);
    } catch (error) {
      console.error("Cart Transaction Failed: ", error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async mergeGuestCartToUserCart(
    guestCartItems: GuestCartMergeDTO,
    authUser: IAuthUser,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!guestCartItems?.guestCartItems?.length) {
        await queryRunner.commitTransaction();
        return this.activeCartByUserId(authUser.id);
      }

      const customer = await this.userService.findByIdBase(authUser.id);
      if (!customer?.id) {
        throw new BadRequestException("User data not found!");
      }

      // Create cart if not exists
      let currentCartId = customer?.activeCartId ?? null;
      if (!currentCartId) {
        const newCart = await queryRunner.manager.save(Cart, { userId: customer.id });
        currentCartId = newCart.id;
      }

      // Process each guest cart item
      for (const guestItem of guestCartItems.guestCartItems) {
        if (!guestItem?.variantOptionId && !guestItem?.productId) {
          continue; // Skip invalid items
        }

        // Check if item already exists in user cart
        const whereQuery: any = {
          cartId: currentCartId,
        };
        if (guestItem?.variantOptionId) {
          whereQuery.productVariantOptionId = guestItem.variantOptionId;
        } else if (guestItem?.productId) {
          whereQuery.productId = guestItem.productId;
        }

        const existingCartItem = await queryRunner.manager.findOne(CartItem, {
          where: whereQuery,
        });

        // Get product/variant details
        let variantOption = null;
        let product = null;

        if (guestItem?.variantOptionId) {
          variantOption = await this.productVariantOptionService.isExist(
            { id: guestItem.variantOptionId },
            { relations: { product: true, variant: true, variantOption: true } }
          );
          if (!variantOption) continue; // Skip if variant not found
          product = variantOption.product;
        } else if (guestItem?.productId) {
          product = await this.productService.isExist(
            { id: guestItem.productId },
            { relations: { author: true, translator: true, publication: true } }
          );
          if (!product) continue; // Skip if product not found
        }

        if (!product) continue; // Skip if no valid product found

        const cartItemData = {
          variantOption: variantOption,
          variantOptionId: variantOption?.id,
          productVariantOptionId: variantOption?.id,
          productVariantOption: variantOption,
          product: product,
          productId: product.id,
          quantity: guestItem.quantity,
          cartId: currentCartId,
          createdBy: authUser,
        };

        if (existingCartItem) {
          // Overwrite existing quantity with guest quantity (guest latest state)
          const updatedQuantity = guestItem.quantity;
          if (updatedQuantity <= 0) {
            // If guest sent 0 or negative, remove the item from cart
            await queryRunner.manager.delete(CartItem, { id: existingCartItem.id });
          } else {
            const updated = {
              id: existingCartItem.id,
              quantity: updatedQuantity,
            };
            await queryRunner.manager.save(
              dtoToModelMapper(this.dataSource, CartItem, updated),
            );
          }
        } else {
          // Add new item to cart
          await queryRunner.manager.save(
            dtoToModelMapper(this.dataSource, CartItem, cartItemData),
          );
        }
      }

      // Update user's active cart if needed
      if (!customer?.activeCartId) {
        await queryRunner.manager.save(User, { 
          id: customer.id, 
          activeCartId: currentCartId 
        });
      }

      await queryRunner.commitTransaction();
      return this.activeCartByUserId(customer?.id);
    } catch (error) {
      console.error("Cart Merge Transaction Failed: ", error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
