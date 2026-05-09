import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { BrandInternalController } from './controllers/internal/brand.internal.controller';
import { CategoryInternalController } from './controllers/internal/category.internal.controller';
import { GenreInternalController } from './controllers/internal/genre.internal.controller';
import { ProductInternalController } from './controllers/internal/product.internal.controller';
import { ProductQuestionInternalController } from './controllers/internal/productQuestion.internal.controller';
import { ProductRequestInternalController } from './controllers/internal/productRequest.internal.controller';
import { SourceShopInternalController } from './controllers/internal/sourceShop.internal.controller';
import { TagInternalController } from './controllers/internal/tag.internal.controller';
import { VariantInternalController } from './controllers/internal/variant.internal.controller';
import { ProductWebController } from './controllers/web/product.web.controller';
import { ProductQuestionWebController } from './controllers/web/productQuestion.web.controller';
import { ProductRequestWebController } from './controllers/web/productRequest.web.controller';
import { ProductReviewWebController } from './controllers/web/productReview.web.controller';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { Genre } from './entities/genre.entity';
import { Product } from './entities/product.entity';
import { ProductGenre } from './entities/productGenres.entity';
import { ProductMedia } from './entities/productMedia.entity';
import { ProductQuestion } from './entities/productQuestion.entity';
import { ProductQuestionAnswer } from './entities/productQuestionAnswer.entity';
import { ProductRequest } from './entities/productRequest.entity';
import { ProductReview } from './entities/productReview.entity';
import { ProductVariantOption } from './entities/productVariantOption.entity';
import { SourceShop } from './entities/sourceShop.entity';
import { Tag } from './entities/tag.entity';
import { Variant } from './entities/variant.entity';
import { VariantOption } from './entities/variantOption.entity';
import { BrandService } from './services/brand.service';
import { CategoryService } from './services/category.service';
import { GenreService } from './services/genre.service';
import { ProductService } from './services/product.service';
import { ProductGenreService } from './services/productGenre.service';
import { ProductMediaService } from './services/productMedia.service';
import { ProductQuestionService } from './services/productQuestion.service';
import { ProductQuestionAnswerService } from './services/productQuestionAnswer.service';
import { ProductRequestService } from './services/productRequest.service';
import { ProductReviewService } from './services/productReview.service';
import { ProductVariantOptionService } from './services/productVariantOption.service';
import { SourceShopService } from './services/sourceShop.service';
import { TagService } from './services/tag.service';
import { VariantService } from './services/variant.service';
import { VariantOptionService } from './services/variantOption.service';
import { ProductSubscriber } from './subscribers/product.subscriber';
import { ProductReviewInternalController } from './controllers/internal/productReview.internal.controller';
import { CategoryWebController } from './controllers/web/category.web.controller';
import { ProductCategoryService } from './services/productCategory.service';
import { ProductCategory } from './entities/productCategories.entity';

const entities = [
  Genre,
  Tag,
  Category,
  Variant,
  VariantOption,
  SourceShop,
  Brand,
  Product,
  ProductVariantOption,
  ProductMedia,
  ProductGenre,
  ProductCategory,
  ProductQuestion,
  ProductQuestionAnswer,
  ProductReview,
  ProductRequest
];

const services = [
  GenreService,
  TagService,
  CategoryService,
  VariantService,
  VariantOptionService,
  SourceShopService,
  BrandService,
  ProductService,
  ProductVariantOptionService,
  ProductMediaService,
  ProductGenreService,
  ProductCategoryService,
  ProductReviewService,
  ProductRequestService,
  ProductQuestionService,
  ProductQuestionAnswerService,
];
const subscribers = [ProductSubscriber];

const controllers = [];
const webControllers = [ProductWebController, ProductReviewWebController, ProductQuestionWebController, ProductRequestWebController, CategoryWebController];
const internalControllers = [
  GenreInternalController,
  TagInternalController,
  CategoryInternalController,
  VariantInternalController,
  SourceShopInternalController,
  BrandInternalController,
  ProductInternalController,
  ProductQuestionInternalController,
  ProductRequestInternalController,
  ProductReviewInternalController
];

const modules = [
  forwardRef(() => OrderModule),
];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...webControllers, ...internalControllers],
})
export class ProductModule { }