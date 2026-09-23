import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class PurchaseItemDTO {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Existing product id from inventory',
    example: 'product uuid',
  })
  @IsOptional()
  @IsString()
  productId?: string;

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
}