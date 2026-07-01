import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ENUM_PRODUCT_CONDITION, ENUM_PRODUCT_SEGMENT, ENUM_PRODUCT_STATUS } from '../../const';
import { IAuthUser } from '@src/app/interfaces';

export class ProductGenreUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  readonly genreId!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}
export class ProductCategoryUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  readonly categoryId!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted!: boolean;

  @IsOptional()
  readonly updatedBy?: IAuthUser;
}
export class ProductTagUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  readonly tagId!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}
export class ProductMediaUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  readonly galleryId!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}

export class ProductVariantUpdateDTO {
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c',
  })
  @IsOptional()
  @IsString()
  readonly sku!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  @IsUUID()
  readonly variantId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  @IsUUID()
  readonly variantOptionId!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 450,
  })
  @IsOptional()
  @IsNumber()
  readonly additionalSourcingPrice!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 450,
  })
  @IsOptional()
  @IsNumber()
  readonly additionalMRP!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 450,
  })
  @IsOptional()
  @IsNumber()
  readonly additionalDiscount!: number;

  @ApiProperty({
    type: Number,
    required: false,
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
  readonly updatedBy?: any;
}
export class ProductUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Animal Farm',
  })
  @IsOptional()
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
    required: false,
    example: 'animal-farm',
  })
  @IsOptional()
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
    example: `A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress, justice...`,
  })
  @IsOptional()
  @IsString()
  readonly flap!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: `A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress, justice...`,
  })
  @IsOptional()
  @IsString()
  readonly description!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: `Short description of the product (richtext from frontend).`,
  })
  @IsOptional()
  @IsString()
  readonly shortDescription!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: {
      isbn: "swjdw",
      page: 300,
      flap: `The story is about Jim, a young boy who goes in search of treasure after finding a treasure map. Jim faces shipwreck, a pirate mutiny, and sword fights. Jim's tale is a rags-to-riches story of a young boy who overcomes the odds.`
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
    required: false,
    example: 450,
  })
  @IsOptional()
  readonly sourcingPrice!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 950,
  })
  @IsOptional()
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
    type: Number,
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  readonly position!: number;

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
    example: 'author who transated uuid',
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
    example: 'subcategory uuid',
  })
  @IsOptional()
  @IsString()
  readonly subcategoryId!: string;

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
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly hasVariant!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: '7c5216e41d93',
  })
  @IsString()
  @IsOptional()
  readonly sku!: string;

  @ApiProperty({
    type: [ProductVariantUpdateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductVariantUpdateDTO)
  @IsOptional()
  readonly variants!: ProductVariantUpdateDTO[];

  @ApiProperty({
    type: [ProductGenreUpdateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductGenreUpdateDTO)
  @IsOptional()
  readonly genres!: ProductGenreUpdateDTO[];

  @ApiProperty({
    type: [ProductCategoryUpdateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductCategoryUpdateDTO)
  @IsOptional()
  readonly categories!: ProductCategoryUpdateDTO[];

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsOptional()
  readonly tags!: string[];

  @ApiProperty({
    type: [ProductMediaUpdateDTO],
    required: false,
  })
  @ValidateNested()
  @Type(() => ProductMediaUpdateDTO)
  @IsOptional()
  readonly medias!: ProductMediaUpdateDTO[];

  @IsOptional()
  readonly updatedBy?: any;
}