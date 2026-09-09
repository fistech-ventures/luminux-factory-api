import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class UpdateExpenseDTO {
  @ApiProperty({
    type: Date,
    required: false,
    example: '2025-10-09',
  })
  @IsOptional()
  date?: Date;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Office rent',
  })
  @IsOptional()
  purpose?: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 1000,
  })
  @IsOptional()
  amountSpent?: number;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod?: ENUM_PAYMENT_METHODS;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Nahid',
  })
  @IsOptional()
  spentBy?: string;

  @IsOptional()
  readonly updatedBy?: string;
}
