import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';
import { PurchaseItemDTO } from './purchase-item.dto';

export class UpdatePurchaseDTO {
  @ApiProperty({ type: Date, required: false, example: '2026-09-05' })
  @IsOptional()
  @Type(() => Date)
  purchaseDate?: Date;

  @ApiProperty({ type: String, required: false, example: 'Bangladesh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  purchaseType?: string;

  @ApiProperty({ type: String, required: false, example: 'supplier uuid' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ type: [PurchaseItemDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDTO)
  items?: PurchaseItemDTO[];

  @ApiProperty({ type: Number, required: false, example: 8000 })
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

  @ApiProperty({ type: String, required: false, example: 'user uuid' })
  @IsOptional()
  @IsString()
  purchasedById?: string;
  
  @IsOptional()
  readonly updatedBy?: string;
}
