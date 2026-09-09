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
    enum: ['customer', 'supplier'],
    example: 'customer',
    description: 'customer => collection from customer, supplier => payment to supplier',
  })
  @IsNotEmpty()
  @IsIn(['customer', 'supplier'])
  entityType: 'customer' | 'supplier';

  @ApiProperty({ type: String, required: true, example: 'customer or supplier uuid' })
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