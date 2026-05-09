import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { CacheRevalidateKeys } from '@src/app/decorators/cacheRevalidate.decorator';
import { InternalRequestInterceptor } from '@src/app/interceptors';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { UuidValidationPipe } from '@src/app/pipes/uuidValidation.pipe';
import { SuccessResponse } from '@src/app/types';
import { Between, FindOptionsRelations, In, Raw } from 'typeorm';
import { ProductCreateDTO } from '../../dtos/product/create.dto';
import { ProductFilterDTO } from '../../dtos/product/filter.dto';
import { ProductUpdateDTO } from '../../dtos/product/update.dto';
import { ProductReviewCreateDTO } from '../../dtos/productReview/create.dto';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../services/product.service';
import { ProductReviewService } from '../../services/productReview.service';
import { FilterBulkByIdsDTO } from '@src/app/base';

@ApiTags('Product')
@ApiBearerAuth()
@UseInterceptors(InternalRequestInterceptor)
@Controller('internal/products')
export class ProductInternalController {
  constructor(
    private readonly service: ProductService,
    private readonly productReviewService: ProductReviewService
  ) { }
  RELATIONS: FindOptionsRelations<Product> = {
    author: true,
    translator: true,
    publication: true,
    category: true,
    sourceShop: true,
    brand: true,
    variants: {
      variant: true,
      variantOption: true
    },
    medias: { gallery: true },
    genres: { genre: true },
    categories: { category: true },
  };

  @Get()
  async findAll(@Query() query: ProductFilterDTO): Promise<SuccessResponse<Product[]>> {
    if (query?.discountMin && query?.discountMax) {
      query['discountPercentage'] = Between(query?.discountMin, query?.discountMax);
    }
    if (query?.ratingPointAvgMin && query?.ratingPointAvgMax) {
      query['ratingPointAvg'] = Between(query?.ratingPointAvgMin, query?.ratingPointAvgMax);
    }
    if (query.productTags?.length) {
      query['tags'] = Raw((alias) => `${alias} @> :tags`, {
        tags: JSON.stringify(query.productTags),
      });
    }
    if (query?.productCategoryId) {
      delete query?.categoryId;
      query['productCategories'] = {
        categoryId: query?.productCategoryId
      }
    }
    delete query?.productTags
    delete query?.discountMin
    delete query?.discountMax
    delete query?.ratingPointAvgMax;
    delete query?.ratingPointAvgMin;
    delete query?.productCategoryId;

    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id/has-ordered')
  async checkById(@Param('id') id: string, @AuthUser() authUser: IAuthUser): Promise<SuccessResponse> {
    return this.service.checkProductIfOrderdByUser(authUser.id, id)
  }

  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.service.findOneBase({ slug }, { relations: this.RELATIONS });
  }

  @Get('by-code/:code')
  async findByCode(@Param('code') code: string): Promise<Product> {
    return this.service.findOneBase({ code }, { relations: this.RELATIONS });
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Product> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post('reviews')
  async createProductReview(@Body() body: ProductReviewCreateDTO, @AuthUser() authUser: IAuthUser): Promise<Product> {
    // const checkOrderData = await this.service.checkProductIfOrderdByUser(authUser.id, body.productId)
    // if (checkOrderData.data.hasOrdered)
    body['source'] = 'panel'
    return this.productReviewService.createOne(body, authUser);
    // else throw new BadRequestException('You must order & receieve the product to share review!')
  }

  @CacheRevalidateKeys(['products'])
  @UseInterceptors(CacheInterceptor)
  // @Public()
  @Post()
  async create(@Body() body: ProductCreateDTO): Promise<Product> {
    return this.service.createProduct(body, this.RELATIONS);
  }

  @Post('find-by-ids')
  async findBulkByIds(@Body() payload: FilterBulkByIdsDTO): Promise<SuccessResponse<Product[]>> {
    return this.service.findAllBase({ id: In(payload.ids) as any, limit: 50 }, { relations: this.RELATIONS });
  }

  @CacheRevalidateKeys(['products'])
  @UseInterceptors(CacheInterceptor)
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() body: ProductUpdateDTO,
  ): Promise<Product> {
    return this.service.updateProduct(id, body, this.RELATIONS);
  }
}