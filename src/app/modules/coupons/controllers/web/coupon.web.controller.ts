import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { ApplyCouponDto } from '../../dtos/apply-coupon.dto';
import { CouponValidationService } from '../../services/coupon-validation.service';

@ApiTags('Coupon')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/coupons')
export class CouponWebController {
  constructor(private readonly couponValidationService: CouponValidationService) {}

  @Post('apply')
  async apply(@Body() body: ApplyCouponDto & { userId?: string; cartTotal: number; cartItems?: any[] }): Promise<{
    coupon: any;
    discountAmount: number;
  }> {
    const { code, userId, cartTotal, cartItems } = body;
    const result = await this.couponValidationService.validate({
      code,
      userId,
      cartTotal,
      cartItems,
    });
    return {
      coupon: result.coupon,
      discountAmount: result.discountAmount,
    };
  }

  @Post('redeem')
  async redeem(@Body() body: { code: string; userId?: string; orderId?: string; discountAmount: number }): Promise<any> {
    const { code, userId, orderId, discountAmount } = body;
    return this.couponValidationService.redeem({
      code,
      userId,
      orderId,
      discountAmount,
    });
  }
}
