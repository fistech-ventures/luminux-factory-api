import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ENUM_PRODUCT_REQUEST_STATUS } from '../../const';

export class ProductRequestStatusUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_PRODUCT_REQUEST_STATUS.PENDING),
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ENUM_PRODUCT_REQUEST_STATUS)
  readonly status!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '119 Khan Villa, 9/A West Dhanmondi, Dhaka',
  })
  @IsOptional()
  @IsString()
  readonly addressDetails!: string;

  @IsOptional()
  readonly updatedBy?: any;
}