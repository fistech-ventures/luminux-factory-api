import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class CreateExpenseDTO {
  @ApiProperty({
    type: Date,
    required: true,
    example: '2025-10-09',
  })
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Office rent',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  purpose: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  amountSpent: number;

  @ApiProperty({
    type: String,
    required: true,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsNotEmpty()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod: ENUM_PAYMENT_METHODS;

  @ApiProperty({
    type: String,
    required: true,
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  spentBy: string;

  @IsOptional()
  readonly createdBy?: any;
}
