import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsOptional, IsString } from 'class-validator';

export class FilterPurchaseDTO extends BaseFilterDTO {
  @ApiProperty({ type: String, required: false, example: 'supplier uuid' })
  @IsOptional()
  @IsString()
  supplierId?: string;
}