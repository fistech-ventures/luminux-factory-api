import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class ProductVariantOptionCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'er9r8e4ew',
  })
  @IsNotEmpty()
  @IsString()
  readonly sku!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly additionalSourcingPrice!: number;

  @ApiProperty({
    type: Number,
    required: true,
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly additionalMRP!: number;

  @ApiProperty({
    type: Number,
    required: true,
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly additionalDiscount!: number;

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
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly createdBy?: any;
}