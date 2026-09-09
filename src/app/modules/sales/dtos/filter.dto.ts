import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class FilterSaleDTO extends BaseFilterDTO {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  soldById?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod?: ENUM_PAYMENT_METHODS;
}
