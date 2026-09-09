import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class ProfitFilterDTO {
  @ApiProperty({ type: Number, required: false, default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({ type: Number, required: false, default: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_METHODS,
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod?: ENUM_PAYMENT_METHODS;
}
