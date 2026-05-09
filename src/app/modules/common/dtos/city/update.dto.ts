import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CityUpdateDTO {
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
    example: 'Dhaka',
  })
  @IsOptional()
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
  readonly updatedBy?: any;
}
