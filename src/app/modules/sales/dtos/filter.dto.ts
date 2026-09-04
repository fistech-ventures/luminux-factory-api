import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsOptional, IsString } from 'class-validator';

export class FilterSaleDTO extends BaseFilterDTO {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  soldById?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
