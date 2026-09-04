import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductFilterDTO extends BaseFilterDTO {
  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  sourcingPrice?: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  productCode?: string;
}
