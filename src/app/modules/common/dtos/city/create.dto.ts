import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class CityCreateDTO {
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
    example: 'Dhaka',
  })
  @IsNotEmpty()
  @IsString()
  readonly titleBn!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'delivery Charge id',
  })
  @IsOptional()
  @IsUUID()
  readonly deliveryChargeId!: string;

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
