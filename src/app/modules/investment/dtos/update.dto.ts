import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateInvestmentDTO {
  @ApiProperty({ type: Date, required: false, example: '2026-09-24' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @ApiProperty({ type: String, required: false, example: 'Showroom expansion' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ type: String, required: false, example: 'employee-uuid' })
  @IsOptional()
  @IsUUID()
  investorId?: string;

  @ApiProperty({ type: Number, required: false, example: 50000 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  readonly updatedBy?: any;
}
