import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';
import { SaleItemDTO } from './sale-item.dto';

export class UpdateSaleDTO {
  @ApiProperty({ type: Date, required: false, example: '2026-09-05' })
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({ type: String, required: false, example: 'customer uuid' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ type: [SaleItemDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDTO)
  items?: SaleItemDTO[];

  @ApiProperty({ type: Number, required: false, default: 0, example: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ type: Number, required: false, example: 5000 })
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod?: ENUM_PAYMENT_METHODS;

  @ApiProperty({ type: String, required: false, example: 'Home' })
  @IsOptional()
  @IsString()
  shippingTo?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  shippingContact?: string;

  @ApiProperty({ type: String, required: false, example: 'user uuid' })
  @IsOptional()
  @IsString()
  soldById?: string;

  @IsOptional()
  readonly updatedBy?: string;
}
