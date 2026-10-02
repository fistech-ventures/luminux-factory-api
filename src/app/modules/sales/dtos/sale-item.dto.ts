import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SaleItemDTO {
  @ApiProperty({ type: String, enum: ['product', 'rawMaterial'], required: false, default: 'product' })
  @IsOptional()
  @IsIn(['product', 'rawMaterial'])
  itemType?: 'product' | 'rawMaterial';

  @ApiProperty({ type: String, required: false, example: 'product uuid' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ type: String, required: false, example: 'raw material uuid' })
  @IsOptional()
  @IsString()
  rawMaterialId?: string;

  @ApiProperty({ type: String, required: false, example: 'raw material combination uuid' })
  @IsOptional()
  @IsString()
  rawMaterialCombinationId?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Product variant option id',
    example: 'variant uuid',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ type: String, required: false, description: 'Sellable product SKU id' })
  @IsOptional()
  @IsString()
  skuId?: string;

  @ApiProperty({ type: Number, required: true, example: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.000001)
  quantity: number;

  // Unit price this sale is actually made at, entered by the user. A product
  // can be sold at any price regardless of its configured selling price.
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Unit price the product is sold at for this sale',
    example: 120,
  })
  @IsNotEmpty()
  @IsNumber()
  sellingPrice: number;
}