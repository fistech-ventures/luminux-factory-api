import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class ProductVariantOptionCreateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'er9r8e4ew',
  })
  @IsOptional()
  @IsString()
  readonly sku!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  readonly sellingPrice!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  readonly stockQuantity!: number;

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly productId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly variantId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly variantOptionId!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  readonly position!: number;

  @IsOptional()
  readonly createdBy?: any;
}
