import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHODS, ENUM_TRANSACTION_TYPES } from '@src/shared';

export class AccountTransactionFilterDTO {
  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.BKASH,
    description: 'Filter by account (payment method) e.g. cash, bKash, nagad, rocket, upay, bank',
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_METHODS)
  accountType?: ENUM_PAYMENT_METHODS;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_TRANSACTION_TYPES,
    example: ENUM_TRANSACTION_TYPES.CASH_IN,
    description: 'cashIn => money coming in (sales, collections), cashOut => money going out (purchases, expenses, supplier payments)',
  })
  @IsOptional()
  @IsEnum(ENUM_TRANSACTION_TYPES)
  transactionType?: ENUM_TRANSACTION_TYPES;

  @ApiProperty({ type: String, required: false, example: '2026-09-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ type: String, required: false, example: '2026-09-30' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ type: Number, required: false, default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiProperty({ type: Number, required: false, default: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: number;
}