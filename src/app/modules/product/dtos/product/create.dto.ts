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

export class ProductCreateDTO {
  @ApiProperty({ type: String, required: true, example: 'Rice 25kg' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly title!: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

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

  @ApiProperty({ type: [ProductVariantOptionDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantOptionDTO)
  readonly variants?: ProductVariantOptionDTO[];

  @IsOptional()
  readonly createdBy?: any;
}
