import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ENUM_DISCOUNT_TYPE } from '../../const';

export class CreateDiscountRuleDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'FLAT',
    enum: Object.values(ENUM_DISCOUNT_TYPE),
  })
  @IsEnum(ENUM_DISCOUNT_TYPE)
  @IsString()
  readonly type!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  readonly discountValue?: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  readonly buyQuantity?: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  readonly getQuantity?: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  readonly getPercentage?: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  readonly maxDiscountCap?: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  readonly minOrderAmount?: number;

  @IsOptional()
  readonly createdBy?: any;
}
