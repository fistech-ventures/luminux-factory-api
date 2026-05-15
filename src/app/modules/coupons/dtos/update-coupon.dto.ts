import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ENUM_COUPON_DISCOUNT_TYPE } from '../const';

export class UpdateCouponDto {
  @ApiProperty({
    type: String,
    required: false,
    example: 'WINTER20',
  })
  @IsOptional()
  @IsString()
  readonly code?: string;

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
    required: false,
    example: 'FLAT',
    enum: Object.values(ENUM_COUPON_DISCOUNT_TYPE),
  })
  @IsOptional()
  @IsEnum(ENUM_COUPON_DISCOUNT_TYPE)
  readonly discountType?: string;

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
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly startsAt?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly endsAt?: Date;

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
  readonly updatedBy?: any;
}
