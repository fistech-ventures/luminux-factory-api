import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ProductVariantOptionDTO {
  @ApiProperty({ type: String, required: true, example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  readonly variantId!: string;

  @ApiProperty({ type: String, required: true, example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  readonly variantOptionId!: string;

  @ApiProperty({ type: String, required: false, example: 'SKU-001' })
  @IsOptional()
  @IsString()
  readonly sku?: string;

  @ApiProperty({ type: Number, required: false, example: 450 })
  @IsOptional()
  @IsNumber()
  readonly sellingPrice?: number;

  @ApiProperty({ type: Number, required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  readonly stockQuantity?: number;

  @ApiProperty({ type: Number, required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  readonly position?: number;
}

export class ProductVariantSkuValueDTO {
  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  readonly position?: number;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsUUID()
  readonly variantId!: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsUUID()
  readonly variantOptionId!: string;
}

export class ProductVariantSkuDTO {
  @ApiProperty({ type: String, required: true, example: 'PX-400-300-BLK' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly productCode!: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  readonly sourcingPrice!: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  readonly sellingPrice!: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  readonly stockQuantity!: number;

  @ApiProperty({ type: [ProductVariantSkuValueDTO], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantSkuValueDTO)
  readonly values!: ProductVariantSkuValueDTO[];
}

export class ProductCreateDTO {
  @ApiProperty({ type: String, required: true, example: 'Rice 25kg' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly title!: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly warranty?: string;

  @ApiProperty({ type: Number, required: false, example: 0 })
  @IsOptional()
  @IsNumber()
  readonly sourcingPrice?: number;

  @ApiProperty({ type: Number, required: false, example: 0 })
  @IsOptional()
  @IsNumber()
  readonly sellingPrice?: number;

  @ApiProperty({ type: String, required: false, example: 'https://.../image.jpg' })
  @IsOptional()
  @IsString()
  readonly thumbnail?: string;

  @ApiProperty({ type: String, required: true, example: 'PRD-1001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly productCode!: string;

  @ApiProperty({ type: Number, required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  readonly stock?: number;

  @ApiProperty({ type: String, required: false, example: 'kg' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly unit?: string;

  @ApiProperty({ type: [ProductVariantOptionDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantOptionDTO)
  readonly variants?: ProductVariantOptionDTO[];

  @ApiProperty({ type: [ProductVariantSkuDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantSkuDTO)
  readonly skus?: ProductVariantSkuDTO[];

  @IsOptional()
  readonly createdBy?: any;
}
