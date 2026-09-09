import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class UpdatePaymentDTO {
  @ApiProperty({ type: Date, required: false, example: '2026-09-06' })
  @IsOptional()
  paymentDate?: Date;

  @ApiProperty({
    type: String,
    required: false,
    enum: ['customer', 'supplier'],
    example: 'customer',
  })
  @IsOptional()
  @IsIn(['customer', 'supplier'])
  entityType?: 'customer' | 'supplier';

  @ApiProperty({ type: String, required: false, example: 'customer or supplier uuid' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ type: Number, required: false, example: 1500 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod?: ENUM_PAYMENT_METHODS;

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
  readonly updatedBy?: string;
}