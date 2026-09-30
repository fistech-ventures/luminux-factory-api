import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';
import { PurchaseItemDTO } from './purchase-item.dto';

export class CreatePurchaseDTO {
  @ApiProperty({ type: Boolean, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: Date, required: true, example: '2026-09-05' })
  @IsNotEmpty()
  @Type(() => Date)
  purchaseDate: Date;

  @ApiProperty({ type: String, required: true, example: 'Bangladesh' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  purchaseType: string;

  @ApiProperty({ type: String, required: true, example: 'supplier uuid' })
  @IsNotEmpty()
  @IsString()
  supplierId: string;

  @ApiProperty({ type: [PurchaseItemDTO], required: true })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDTO)
  items: PurchaseItemDTO[];

  @ApiProperty({ type: Number, required: true, example: 8000 })
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

  @ApiProperty({ type: String, required: true, example: 'user uuid' })
  @IsNotEmpty()
  @IsString()
  purchasedById: string;

  @IsOptional()
  readonly createdBy: string;
}
