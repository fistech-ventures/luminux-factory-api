import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProductVariantSkuDTO } from './create.dto';

export class ProductVariantSkuUpdateDTO extends ProductVariantSkuDTO {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsUUID()
  readonly id?: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted?: boolean;
}

export class ProductVariantOptionUpdateDTO {
  @ApiProperty({ type: String, required: false, example: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly id?: string;

  @ApiProperty({ type: String, required: false, example: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly variantId?: string;

  @ApiProperty({ type: String, required: false, example: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly variantOptionId?: string;

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

  @ApiProperty({ type: Boolean, required: false, example: false })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted?: boolean;
}

export class ProductUpdateDTO {
  @ApiProperty({ type: String, required: false, example: 'Rice 25kg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly title?: string;

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

  @ApiProperty({ type: String, required: false, example: 'PRD-123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly productCode?: string;

  @ApiProperty({ type: Number, required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  readonly stock?: number;

  @ApiProperty({ type: String, required: false, example: 'kg' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly unit?: string;

  @ApiProperty({ type: [ProductVariantOptionUpdateDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantOptionUpdateDTO)
  readonly variants?: ProductVariantOptionUpdateDTO[];

  @ApiProperty({ type: [ProductVariantSkuUpdateDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantSkuUpdateDTO)
  readonly skus?: ProductVariantSkuUpdateDTO[];

  @IsOptional()
  readonly updatedBy?: any;
}
