import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class DashboardQueryDTO {
  @ApiProperty({
    type: Number,
    required: false,
    description:
      'Number of days to include in the charts (default 7). Ignored when startDate/endDate are passed.',
  })
  @IsOptional()
  @IsNumberString()
  days?: number;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'How many recent sales to include (default 5).',
  })
  @IsOptional()
  @IsNumberString()
  recentLimit?: number;
}
