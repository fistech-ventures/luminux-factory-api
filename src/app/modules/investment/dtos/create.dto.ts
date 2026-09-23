import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateInvestmentDTO {
  @ApiProperty({ type: Date, required: true, example: '2026-09-24' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ type: String, required: true, example: 'Showroom expansion' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ type: String, required: true, example: 'employee-uuid' })
  @IsNotEmpty()
  @IsUUID()
  investorId: string;

  @ApiProperty({ type: Number, required: true, example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  readonly createdBy?: any;
}
