import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductionDTO {
  @ApiProperty({ type: Number, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCost?: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  quantity?: number;

  @ApiProperty({ enum: ['pending', 'approved'], required: false })
  @IsOptional()
  @IsIn(['pending', 'approved'])
  status?: 'pending' | 'approved';
}
