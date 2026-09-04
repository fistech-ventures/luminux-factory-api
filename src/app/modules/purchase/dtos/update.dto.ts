import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
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

  @ApiProperty({ type: String, required: false, example: 'user uuid' })
  @IsOptional()
  @IsString()
  purchasedById?: string;
  
  @IsOptional()
  readonly updatedBy?: string;
}
