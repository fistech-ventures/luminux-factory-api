import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from '@src/app/base';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ENUM_PRODUCT_SEGMENT, ENUM_PRODUCT_STATUS, ENUM_PRODUCT_TYPE } from '../../const';

export class ProductFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  readonly page: number = 1;

  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  readonly limit: number = 10;

  @ApiProperty({
    type: String,
    description: 'The search term',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: Boolean,
    example: '',
    required: false,
  })
  @IsOptional()
  isActive!: boolean;

  @ApiProperty({
    type: Boolean,
    example: '',
    required: false,
  })
  @IsOptional()
  readonly isNewArrived!: boolean;

  @ApiProperty({
    type: Boolean,
    example: '',
    required: false,
  })
  @IsOptional()
  readonly isFeatured!: boolean;

  @ApiProperty({
    type: Boolean,
    example: '',
    required: false,
  })
  @IsOptional()
  readonly isFreeDelivery!: boolean;

  @ApiProperty({
    type: Boolean,
    example: '',
    required: false,
  })
  @IsOptional()
  readonly isForPreOrder!: boolean;

  @ApiProperty({
    type: Number,
    description: '25',
    required: false,
  })
  @IsOptional()
  discountMin!: boolean;

  @ApiProperty({
    type: Number,
    description: '52',
    required: false,
  })
  @IsOptional()
  discountMax!: boolean;

  @ApiProperty({
    type: Number,
    description: '3',
    required: false,
  })
  @IsOptional()
  ratingPointAvgMin!: boolean;

  @ApiProperty({
    type: Number,
    description: '5',
    required: false,
  })
  @IsOptional()
  ratingPointAvgMax!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    description: Object.values(ENUM_PRODUCT_STATUS).join(' / '),
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_PRODUCT_STATUS)
  status!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: Object.values(ENUM_PRODUCT_SEGMENT).join(' / '),
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_PRODUCT_SEGMENT)
  readonly segment!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: Object.values(ENUM_PRODUCT_TYPE).join(' / '),
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_PRODUCT_TYPE)
  readonly type!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  categoryId!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  productCategoryId!: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Filter products by multiple category IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  productCategoryIds?: string[];

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  readonly publicationId!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  readonly authorId!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  readonly translatorId!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'source shop uuid',
  })
  @IsOptional()
  @IsString()
  readonly sourceShopId!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'brand uuid',
  })
  @IsOptional()
  @IsString()
  readonly brandId!: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  productTags?: string[];

  @ApiProperty({
    type: String,
    description: 'createdAt',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    type: String,
    description: 'ASC/DESC',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: SortOrder;
}
