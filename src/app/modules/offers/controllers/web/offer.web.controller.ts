import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { Offer } from '../../entities/offer.entity';
import { OfferResolutionService } from '../../services/offer-resolution.service';
import { OfferService } from '../../services/offer.service';

@ApiTags('Special Offer')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/offers')
export class OfferWebController {
  constructor(
    private readonly offerResolutionService: OfferResolutionService,
    private readonly offerService: OfferService,
  ) {}

  @Public()
  @Get()
  async findAll(): Promise<Offer[]> {
    return this.offerService.findAll();
  }

  @Public()
  @Get('resolve')
  async resolveForItem(
    @Query('productId') productId?: string,
    @Query('variantId') variantId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('quantity') quantity?: string,
    @Query('unitPrice') unitPrice?: string,
  ): Promise<{
    eligibleOffers: Array<Offer & { savingAmount: number; discountTag?: string }>;
    defaultOffer: (Offer & { savingAmount: number; discountTag?: string }) | null;
  }> {
    return this.offerResolutionService.resolveForItem({
      productId,
      variantId,
      categoryId,
      quantity: quantity ? parseInt(quantity) : 1,
      unitPrice: unitPrice ? parseInt(unitPrice) : undefined,
    });
  }

  @Public()
  @Get(':slug')
  async getProductsBySlug(@Param('slug') slug: string): Promise<{
    offer: Offer;
    products: Array<any>;
  }> {
    return this.offerService.getProductsBySlug(slug);
  }
}
