import { ApiProperty } from '@nestjs/swagger';
import { ENUM_DELIVERY_ZONE } from '@src/app/modules/order/const';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class DeliveryChargeUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Dhaka',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_DELIVERY_ZONE).join(' / '),
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_DELIVERY_ZONE)
  readonly deliveryZone!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 120,
  })
  @IsOptional()
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
  readonly updatedBy?: any;
}
