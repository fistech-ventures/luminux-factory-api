import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AreaCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Balughat, Dhaka Cantonment',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'বালুঘাট, ঢাকা ক্যান্টনমেন্ট',
  })
  @IsOptional()
  @IsString()
  readonly titleBn!: string;

  // @ApiProperty({
  //   type: String,
  //   required: true,
  //   example: 'city id',
  // })
  // @IsNotEmpty()
  // @IsUUID()
  // readonly cityId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'delivery Charge id',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly deliveryChargeId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly createdBy?: any;
}
