import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import {
  ProductVariantOptionDTO,
  ProductVariantSkuDTO,
  ProductVariantSkuValueDTO,
} from '../../product/dtos/product/create.dto';

export class PurchaseCombinationDTO {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  rawMaterialCombinationId?: string;

  @ApiProperty({ type: String, required: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  productCode?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  skuId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.000001)
  quantity!: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty()
  @IsNumber()
  totalProductCost!: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  otherCost?: number;

  @ApiProperty({ type: [ProductVariantSkuValueDTO], required: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantSkuValueDTO)
  values?: ProductVariantSkuValueDTO[];
}

export class PurchaseItemDTO {
  @ApiProperty({ type: String, enum: ['product', 'rawMaterial'], required: false, default: 'product' })
  @IsOptional()
  @IsIn(['product', 'rawMaterial'])
  itemType?: 'product' | 'rawMaterial';

  @ApiProperty({
    type: String,
    required: false,
    description: 'Existing product id from inventory',
    example: 'product uuid',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ type: String, required: false, description: 'Existing raw material id' })
  @IsOptional()
  @IsString()
  rawMaterialId?: string;

  @ApiProperty({ type: String, required: false, description: 'Raw-material combination id' })
  @IsOptional()
  @IsString()
  rawMaterialCombinationId?: string;

  @ApiProperty({ type: String, required: false, description: 'Name for a new raw material' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rawMaterialName?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      'ProductVariantOption id, used when purchasing stock for an existing variant of an existing product. Must be passed together with productId.',
    example: 'product variant uuid',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ type: String, required: false, description: 'Sellable product SKU id' })
  @IsOptional()
  @IsString()
  skuId?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Product name, used when creating a new product not in inventory',
    example: 'Product A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productName?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Manual product code, required when creating a new product',
    example: 'PRD-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  productCode?: string;

  @ApiProperty({ type: Number, required: true, example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.000001)
  quantity: number;

  @ApiProperty({ type: Number, required: true, example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  totalProductCost: number;

  @ApiProperty({ type: Number, required: true, example: 200 })
  @IsNotEmpty()
  @IsNumber()
  otherCost: number;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Product unit (kg, pcs, meter, etc.)',
    example: 'kg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({ type: [ProductVariantOptionDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantOptionDTO)
  variants?: ProductVariantOptionDTO[];

  @ApiProperty({ type: [ProductVariantSkuDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantSkuDTO)
  skus?: ProductVariantSkuDTO[];

  @ApiProperty({ type: [PurchaseCombinationDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseCombinationDTO)
  combinations?: PurchaseCombinationDTO[];
}