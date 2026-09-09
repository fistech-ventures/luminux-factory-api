import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { IsEnum, IsOptional } from 'class-validator';
import { ENUM_CUSTOMER_TYPES } from '@src/shared';

export class CustomerFilterDTO extends BaseFilterDTO {
  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_CUSTOMER_TYPES,
    example: ENUM_CUSTOMER_TYPES.B2C,
  })
  @IsOptional()
  @IsEnum(ENUM_CUSTOMER_TYPES)
  customerType?: ENUM_CUSTOMER_TYPES;
}