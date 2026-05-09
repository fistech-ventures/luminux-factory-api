import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

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
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  readonly additionalSourcingPrice!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  readonly additionalMRP!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  readonly additionalDiscount!: number;

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
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}