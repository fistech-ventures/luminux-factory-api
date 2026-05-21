import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilterBulkByIdsDTO } from '@src/app/base';
import { AuthUser } from '@src/app/decorators';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { WebRequestInterceptor } from '@src/app/interceptors/webRequest.interceptor';
import { IAuthUser } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { Between, FindOptionsRelations, In, Raw } from 'typeorm';
import { ENUM_PRODUCT_QUESTION_ANSWER_STATUS, ENUM_PRODUCT_STATUS } from '../../const';
import { ProductFilterDTO } from '../../dtos/product/filter.dto';
import { ProductQuestionCreateDTO } from '../../dtos/productQuestion/create.dto';
import { ProductReviewCreateDTO } from '../../dtos/productReview/create.dto';
import { Product } from '../../entities/product.entity';
import { ProductQuestion } from '../../entities/productQuestion.entity';
import { ProductReview } from '../../entities/productReview.entity';
import { ProductService } from '../../services/product.service';
import { ProductQuestionService } from '../../services/productQuestion.service';
import { ProductReviewService } from '../../services/productReview.service';

@ApiTags('Product')
@ApiBearerAuth()
@UseInterceptors(WebRequestInterceptor)
@Controller('web/products')
export class ProductWebController {
  constructor(
    private readonly service: ProductService,
    private readonly productReviewService: ProductReviewService,
    private readonly productQuestionService: ProductQuestionService,
  ) {}
  RELATIONS: FindOptionsRelations<Product> = {
    author: true,
    translator: true,
    publication: true,
    category: true,
    brand: true,
    variants: {
      variant: true,
      variantOption: true,
    },
    medias: { gallery: true },
    genres: { genre: true },
    categories: { category: true },
  };

  @CacheKey('products:lists')
  @CacheTTL(3600)
  @Public()
  @Get()
  async findAll(@Query() query: ProductFilterDTO): Promise<SuccessResponse<Product[]>> {
    const filterQuery: any = { ...query };

    if (query?.discountMin && query?.discountMax) {
      filterQuery['discountPercentage'] = Between(query?.discountMin, query?.discountMax);
    }
    if (query?.ratingPointAvgMin && query?.ratingPointAvgMax) {
      filterQuery['ratingPointAvg'] = Between(query?.ratingPointAvgMin, query?.ratingPointAvgMax);
    }
    if (query?.minPrice && query?.maxPrice) {
      filterQuery['saleAmount'] = Between(query?.minPrice, query?.maxPrice);
    } else if (query?.minPrice) {
      filterQuery['saleAmount'] = Raw((alias) => `${alias} >= :minPrice`, { minPrice: query?.minPrice });
    } else if (query?.maxPrice) {
      filterQuery['saleAmount'] = Raw((alias) => `${alias} <= :maxPrice`, { maxPrice: query?.maxPrice });
    }
    delete filterQuery?.minPrice;
    delete filterQuery?.maxPrice;
    filterQuery['isActive'] = true;
    filterQuery['status'] = ENUM_PRODUCT_STATUS.PUBLISHED;

    if (query.productTags?.length) {
      filterQuery['tags'] = Raw((alias) => `${alias} @> :tags`, {
        tags: JSON.stringify(query.productTags),
      });
    }
    if (query?.productCategoryIds?.length) {
      filterQuery['categories'] = {
        categoryId: In(query.productCategoryIds),
      };
    } else if (query?.productCategoryId) {
      filterQuery['categories'] = {
        categoryId: query?.productCategoryId,
      };
    } else if (query?.categoryId) {
      filterQuery['categories'] = {
        categoryId: query?.categoryId,
      };
    }
    delete filterQuery?.productTags;
    delete filterQuery?.discountMax;
    delete filterQuery?.discountMin;
    delete filterQuery?.ratingPointAvgMax;
    delete filterQuery?.ratingPointAvgMin;
    delete filterQuery?.productCategoryId;
    delete filterQuery?.categoryId;
    delete filterQuery?.productCategoryIds;

    // Handle isFavourite filter - global favorite flag
    if (query.isFavourite === true) {
      filterQuery['isFavorite'] = true;
    }
    delete filterQuery?.isFavourite;

    return this.service.findAllBase(filterQuery, {
      select: {
        id: true,
        title: true,
        slug: true,
        code: true,
        thumb: true,
        videoUrl: true,
        mrp: true,
        saleAmount: true,
        discountType: true,
        discountAmount: true,
        discountPercentage: true,
        stockStatus: true,
        hasVariant: true,
        variants: true,
        ratingPointAvg: true,
        ratingCount: true,
        categories: {
          categoryId: true,
          category: {
            id: true,
            title: true,
            icon: true,
            banner: true,
            position: true,
          },
        },
      },
      relations: {
        variants: {
          variantOption: true,
        },
        categories: {
          category: true,
        },
      },
    });
  }

  @Get(':id/has-ordered')
  async checkById(
    @Param('id') id: string,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse> {
    return this.service.checkProductIfOrderdByUser(authUser.id, id);
  }

  @CacheKey('products:details')
  @CacheTTL(3600)
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get('by-slug/:slug')
  async getProductWithRelatedBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.service.getProductBySlugOrId(slug, 'slug');
  }

  @CacheKey('products:details')
  @CacheTTL(3600)
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get('by-code/:code')
  async findByCode(@Param('code') code: string): Promise<Product> {
    return this.service.findOneBase({ code }, { relations: this.RELATIONS });
  }

  @CacheKey('products:related_products_by_productId_{id}')
  @CacheTTL(3600) // 10800 seconds = 6 hours
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get(':id/related')
  async findRelatedProductsById(@Param('id') id: string): Promise<Product[]> {
    return this.service.getRelatedProducts(id);
  }

  @CacheKey('products:reviews_by_productId_{id}')
  @CacheTTL(3600)
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get(':id/reviews')
  async findReviewsByProductId(@Param('id') id: string): Promise<SuccessResponse<ProductReview[]>> {
    return this.productReviewService.findAllBase({ productId: id });
  }

  @CacheKey('products:questions_by_productId_{id}')
  @CacheTTL(3600)
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get(':id/questions')
  async findQuestionsByProductId(
    @Param('id') id: string,
  ): Promise<SuccessResponse<ProductReview[]>> {
    return this.productQuestionService.findAllBase(
      { productId: id, status: ENUM_PRODUCT_QUESTION_ANSWER_STATUS.PUBLISHED },
      { relations: { answer: true } },
    );
  }

  @CacheKey('products:details')
  @CacheTTL(3600)
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Product> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Public()
  @Post('find-by-ids')
  async findBulkByIds(@Body() payload: FilterBulkByIdsDTO): Promise<SuccessResponse<Product[]>> {
    return this.service.findAllBase(
      { id: In(payload.ids) as any, limit: 50 },
      { relations: this.RELATIONS },
    );
  }

  @Post('reviews')
  async createProductRating(
    @Body() body: ProductReviewCreateDTO,
    @AuthUser() authUser: IAuthUser,
  ): Promise<Product> {
    // const checkOrderData = await this.service.checkProductIfOrderdByUser(authUser.id, body.productId)
    // if (checkOrderData.data.hasOrdered)
    body['userId'] = authUser.id;
    body['source'] = 'web';
    return this.productReviewService.createOne(body, authUser);
    // else throw new BadRequestException('You must order & receieve the product to share review!')
  }

  @Public()
  @Post('questions')
  async createProductQuestion(@Body() body: ProductQuestionCreateDTO): Promise<ProductQuestion> {
    body['source'] = 'web';
    return this.productQuestionService.createOneBase(body);
  }

  @Public()
  @Post(':id/toggle-favorite')
  async toggleFavorite(@Param('id') id: string): Promise<SuccessResponse<Product>> {
    const product = await this.service.findByIdBase(id);
    product.isFavorite = !product.isFavorite;
    await this.service.repo.save(product);
    return new SuccessResponse('Product favorite status updated', product);
  }
}
