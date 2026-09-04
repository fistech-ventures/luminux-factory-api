import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ProductVariantOptionUpdateDTO {
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
    required: false,
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  readonly variantId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'uuid',
  })
  @IsOptional()
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
  readonly updatedBy?: any;
}
