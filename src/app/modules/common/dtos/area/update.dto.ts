import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AreaUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Balughat, Dhaka Cantonment',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'বালুঘাট, ঢাকা ক্যান্টনমেন্ট',
  })
  @IsOptional()
  @IsString()
  readonly titleBn!: string;

  // @ApiProperty({
  //   type: String,
  //   required: false,
  //   example: 'city id',
  // })
  // @IsOptional()
  // readonly cityId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}
