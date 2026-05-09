import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { CartService } from '../../services/cart.service';
import { GuestCartMergeDTO } from '../../dtos/cart/guest-cart.dto';

@ApiTags('Cart')
@Public()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/guest-carts')
export class GuestCartWebController {
  constructor(private readonly cartService: CartService) {}

  @Post('merge')
  async mergeGuestCart(@Body() body: GuestCartMergeDTO): Promise<any> {
    // This endpoint is for testing cart merge functionality
    // In production, cart merge happens during login/register
    // For testing, we'll create a temporary user
    const testAuthUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '1234567890'
    };
    
    return this.cartService.mergeGuestCartToUserCart(body, testAuthUser);
  }

  @Public()
  @Get('example')
  async getExampleGuestCart(): Promise<any> {
    // Returns example guest cart structure for frontend reference
    return {
      guestCartItems: [
        {
          productId: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
          variantOptionId: null,
          quantity: 2
        },
        {
          productId: null,
          variantOptionId: '8efe629c-3e94-4fa7-a26d-7c5216e41d94',
          quantity: 1
        }
      ]
    };
  }
}
