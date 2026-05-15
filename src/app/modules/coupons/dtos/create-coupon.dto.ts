import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ENUM_COUPON_DISCOUNT_TYPE } from '../const';

export class CreateCouponDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'WINTER20',
  })
  @IsNotEmpty()
  @IsString()
  readonly code!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Winter special discount',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'FLAT',
    enum: Object.values(ENUM_COUPON_DISCOUNT_TYPE),
  })
  @IsNotEmpty()
  @IsEnum(ENUM_COUPON_DISCOUNT_TYPE)
  readonly discountType!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly discountValue!: number;

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
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  readonly minOrderAmount?: number;

  @ApiProperty({
    type: Date,
    required: true,
    example: '2024-01-01T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly startsAt!: Date;

  @ApiProperty({
    type: Date,
    required: true,
    example: '2024-01-31T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly endsAt!: Date;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiProperty({
    type: Number,
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  readonly maxUsageCount?: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  readonly maxUsagePerUser?: number;

  @IsOptional()
  readonly createdBy?: any;
}
