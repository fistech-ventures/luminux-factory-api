import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { IsOptional, IsUUID } from 'class-validator';

export class InvestmentFilterDTO extends BaseFilterDTO {
  @ApiProperty({ type: String, required: false, example: 'employee-uuid' })
  @IsOptional()
  @IsUUID()
  investorId?: string;
}
