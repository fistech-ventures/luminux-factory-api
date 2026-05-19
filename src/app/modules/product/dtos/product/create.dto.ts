import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ENUM_PRODUCT_CONDITION, ENUM_PRODUCT_SEGMENT, ENUM_PRODUCT_STATUS } from '../../const';
import { IAuthUser } from '@src/app/interfaces';

export class ProductGenreCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly genreId!: string;

  @IsOptional()
  readonly createdBy?: IAuthUser;
}
export class ProductCategoryCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly categoryId!: string;

  @IsOptional()
  readonly createdBy?: IAuthUser;
}
export class ProductVariantCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c',
  })
  @IsString()
  @IsOptional()
  readonly sku!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly variantId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly variantOptionId!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 450,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly additionalSourcingPrice!: number;

  @ApiProperty({
    type: Number,
    required: true,
    example: 450,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly additionalMRP!: number;

  @ApiProperty({
    type: Number,
    required: true,
    example: 450,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly additionalDiscount!: number;

  @ApiProperty({
    type: Number,
    required: true,
    example: 450,
  })
  @IsOptional()
  @IsNumber()
  readonly stockQuantity!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 2,
  })
  @IsOptional()
  readonly position!: number;

  @IsOptional()
  readonly createdBy?: any;
}

export class ProductTagCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly tagId!: string;

  @IsOptional()
  readonly createdBy?: any;
}
export class ProductMediaCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly galleryId!: string;
}

export class ProductCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Treasure Island',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: `The story is about Jim, a young boy who goes in search of treasure after finding a treasure map. Jim faces shipwreck, a pirate mutiny, and sword fights. Jim's tale is a rags-to-riches story of a young boy who overcomes the odds.`,
  })
  @IsOptional()
  @IsString()
  readonly subTitle!: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  readonly alias!: string[];

  @ApiProperty({
    type: String,
    required: true,
    example: 'treasure-island',
  })
  @IsNotEmpty()
  @IsString()
  readonly slug!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_PRODUCT_SEGMENT).join(' / '),
  })
  @IsOptional()
  @IsString()
  readonly segment!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_PRODUCT_CONDITION).join(' / '),
  })
  @IsOptional()
  @IsString()
  readonly condition!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: `The story is about Jim, a young boy who goes in search of treasure after finding a treasure map. Jim faces shipwreck, a pirate mutiny, and sword fights. Jim's tale is a rags-to-riches story of a young boy who overcomes the odds.`,
  })
  @IsOptional()
  @IsString()
  readonly flap!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: `The story is about Jim, a young boy who goes in search of treasure after finding a treasure map. Jim faces shipwreck, a pirate mutiny, and sword fights. Jim's tale is a rags-to-riches story of a young boy who overcomes the odds.`,
  })
  @IsOptional()
  @IsString()
  readonly description!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: {
      isbn: 'swjdw',
      page: 300,
      flap: `The story is about Jim, a young boy who goes in search of treasure after finding a treasure map. Jim faces shipwreck, a pirate mutiny, and sword fights. Jim's tale is a rags-to-riches story of a young boy who overcomes the odds.`,
    },
  })
  @IsOptional()
  readonly specifications!: any;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/thumb-image.jpg',
  })
  @IsOptional()
  @IsString()
  readonly thumb!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/preview.pdf',
  })
  @IsOptional()
  @IsString()
  readonly previewPdf!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/preview.pdf',
  })
  @IsOptional()
  @IsString()
  readonly videoUrl!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 450,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly sourcingPrice!: number;

  @ApiProperty({
    type: Number,
    required: true,
    example: 950,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly mrp!: number;

  @ApiProperty({
    type: String,
    required: false,
    example: 'flat/percentage',
  })
  @IsOptional()
  @IsString()
  discountType!: 'flat' | 'percentage';

  @ApiProperty({
    type: Number,
    required: false,
    example: 250,
  })
  @IsOptional()
  readonly discountAmount!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 250,
  })
  @IsOptional()
  readonly pageCount!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 250,
  })
  @IsOptional()
  readonly stockQuantity!: number;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Bengali',
  })
  @IsOptional()
  @IsString()
  readonly language!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Japaneese',
  })
  @IsOptional()
  @IsString()
  readonly origin!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_PRODUCT_STATUS).join(' / '),
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_PRODUCT_STATUS)
  readonly status!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'author uuid',
  })
  @IsOptional()
  @IsString()
  readonly authorId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'author who translated uuid',
  })
  @IsOptional()
  @IsString()
  readonly translatorId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'publication uuid',
  })
  @IsOptional()
  @IsString()
  readonly publicationId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'category uuid',
  })
  @IsOptional()
  @IsString()
  readonly categoryId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'source shop uuid',
  })
  @IsOptional()
  @IsString()
  readonly sourceShopId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'brand uuid',
  })
  @IsOptional()
  @IsString()
  readonly brandId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiProperty({
    type: Boolean,
    required: true,
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly hasVariant!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isNewArrived!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isBestSeller!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isFeatured!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isFreeDelivery!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isForPreOrder!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: '7c5216e41d93',
  })
  @IsOptional()
  @IsString()
  sku!: string;

  @ApiProperty({
    type: [ProductVariantCreateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductVariantCreateDTO)
  @IsOptional()
  readonly variants!: ProductVariantCreateDTO[];

  @ApiProperty({
    type: [ProductGenreCreateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductGenreCreateDTO)
  @IsOptional()
  readonly genres!: ProductGenreCreateDTO[];

  @ApiProperty({
    type: [ProductCategoryCreateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductCategoryCreateDTO)
  @IsOptional()
  readonly categories!: ProductCategoryCreateDTO[];

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  readonly tags!: string[];

  @ApiProperty({
    type: [ProductMediaCreateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductMediaCreateDTO)
  @IsOptional()
  readonly medias!: ProductMediaCreateDTO[];

  @IsOptional()
  readonly createdBy?: any;
}
