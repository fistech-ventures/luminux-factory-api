import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';
import { SaleItemDTO } from './sale-item.dto';

export class CreateSaleDTO {
  @ApiProperty({ type: Date, required: true, example: '2026-09-05' })
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ type: String, required: true, example: 'customer uuid' })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({ type: [SaleItemDTO], required: true })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDTO)
  items: SaleItemDTO[];

  @ApiProperty({ type: Number, required: true, default: 0, example: 0 })
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @ApiProperty({ type: Number, required: true, example: 5000 })
  @IsNotEmpty()
  @IsNumber()
  paidAmount: number;

  @ApiProperty({
    type: String,
    required: true,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsNotEmpty()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod: ENUM_PAYMENT_METHODS;

  @ApiProperty({ type: String, required: true, example: 'home' })
  @IsNotEmpty()
  @IsString()
  shippingTo: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({ type: String, required: true, example: 'user uuid' })
  @IsNotEmpty()
  @IsString()
  soldById: string;

  @IsOptional()
  readonly createdBy?: string;
}
