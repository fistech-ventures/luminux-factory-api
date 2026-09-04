import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductInternalController } from './controllers/internal/product.internal.controller';
import { ProductVariantOptionInternalController } from './controllers/internal/productVariantOption.internal.controller';
import { VariantInternalController } from './controllers/internal/variant.internal.controller';
import { Product } from './entities/product.entity';
import { ProductVariantOption } from './entities/productVariantOption.entity';
import { Variant } from './entities/variant.entity';
import { VariantOption } from './entities/variantOption.entity';
import { ProductService } from './services/product.service';
import { ProductVariantOptionService } from './services/productVariantOption.service';
import { VariantService } from './services/variant.service';
import { VariantOptionService } from './services/variantOption.service';

const entities = [Product, ProductVariantOption, Variant, VariantOption];
const services = [ProductService, ProductVariantOptionService, VariantService, VariantOptionService];
const subscribers = [];
const webControllers = [];
const internalControllers = [
  ProductInternalController,
  ProductVariantOptionInternalController,
  VariantInternalController,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class ProductModule {}
