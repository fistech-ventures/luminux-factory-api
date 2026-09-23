import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class CreatePaymentDTO {
  @ApiProperty({ type: Date, required: true, example: '2026-09-06' })
  @IsNotEmpty()
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({
    type: String,
    required: true,
    enum: ['customer', 'supplier', 'employee'],
    example: 'customer',
    description:
      'customer => collection from customer, supplier => payment to supplier, employee => advance/expense money given to an employee',
  })
  @IsNotEmpty()
  @IsIn(['customer', 'supplier', 'employee'])
  entityType: 'customer' | 'supplier' | 'employee';

  @ApiProperty({ type: String, required: true, example: 'customer / supplier / employee uuid' })
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @ApiProperty({ type: Number, required: true, example: 1500 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    type: String,
    required: true,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsNotEmpty()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod: ENUM_PAYMENT_METHODS;

  @ApiProperty({ type: String, required: false, example: 'sale or purchase uuid' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ['sale', 'purchase'],
    example: 'sale',
  })
  @IsOptional()
  @IsIn(['sale', 'purchase'])
  referenceType?: 'sale' | 'purchase';

  @ApiProperty({ type: String, required: false, example: 'Partial payment for INV-0003' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  readonly createdBy?: any;
}