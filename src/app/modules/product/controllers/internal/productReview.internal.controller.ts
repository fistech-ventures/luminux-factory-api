import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { getRatingKey } from '@src/shared';
import { FindOptionsRelations } from 'typeorm';
import { ENUM_PRODUCT_REVIEW_STATUS } from '../../const';
import { ProductReviewCreateDTO } from '../../dtos/productReview/create.dto';
import { ProductReviewFilterDTO } from '../../dtos/productReview/filter.dto';
import { ProductReviewStatusUpdateDTO } from '../../dtos/productReview/update.dto';
import { ProductReview } from '../../entities/productReview.entity';
import { ProductService } from '../../services/product.service';
import { ProductReviewService } from '../../services/productReview.service';

@ApiTags('Product Review')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/product-reviews')
export class ProductReviewInternalController {
  constructor(
    private readonly service: ProductReviewService,
    private readonly productService: ProductService
  ) { }
  RELATIONS: FindOptionsRelations<ProductReview> = { user: true, product: true };

  @Get()
  async findAll(@Query() query: ProductReviewFilterDTO): Promise<SuccessResponse<ProductReview[]>> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductReview> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async create(@Body() body: ProductReviewCreateDTO): Promise<ProductReview> {
    body['source'] = 'panel'
    return this.service.createOneBase(body, { relations: this.RELATIONS });
  }

  @Patch(':id/status')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductReviewStatusUpdateDTO,
  ): Promise<ProductReview> {
    const updated = await this.service.updateOneBase(id, body, { relations: { product: true } });
    if (body.status === ENUM_PRODUCT_REVIEW_STATUS.PUBLISHED) {
      const product = updated.product;
      const ratingCount = product.ratingCount + 1;
      const ratingPointTotal = product.ratingPointTotal + updated.rating;
      const ratingPointAvg = ratingPointTotal / ratingCount;

      const ratingKey = getRatingKey(updated.rating); // → "one", "two", etc.
      const updatedRatings = {
        ...product.ratings,
        [ratingKey]: (product.ratings?.[ratingKey] || 0) + 1,
      };

      await this.productService.updateOneBase(product.id, {
        ratingCount,
        ratingPointTotal,
        ratingPointAvg,
        ratings: updatedRatings,
      });
    }
    return updated;
  }
}