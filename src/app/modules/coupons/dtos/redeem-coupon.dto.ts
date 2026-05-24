import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RedeemCouponDto {
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
    description: 'User ID (optional)',
  })
  @IsOptional()
  @IsString()
  readonly userId?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Order ID',
  })
  @IsOptional()
  @IsString()
  readonly orderId?: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Discount amount to apply',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly discountAmount!: number;
}
