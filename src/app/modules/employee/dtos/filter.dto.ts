import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { IsOptional, IsString } from 'class-validator';

export class EmployeeFilterDTO extends BaseFilterDTO {
  @ApiProperty({ type: String, required: false, example: 'Sales Executive' })
  @IsOptional()
  @IsString()
  designation?: string;
}
