import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SaleItemDTO {
  @ApiProperty({ type: String, required: true, example: 'product uuid' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Product variant option id',
    example: 'variant uuid',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ type: Number, required: true, example: 5 })
  @IsNotEmpty()
  @IsNumber()
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