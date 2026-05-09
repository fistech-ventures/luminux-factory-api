import { ApiProperty } from '@nestjs/swagger';
import { ENUM_DELIVERY_ZONE } from '@src/app/modules/order/const';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export class DeliveryChargeCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Dhaka',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_DELIVERY_ZONE).join(' / '),
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ENUM_DELIVERY_ZONE)
  readonly deliveryZone!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 120,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly charge!: number;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly createdBy?: any;
}
