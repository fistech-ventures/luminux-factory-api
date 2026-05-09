import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class VariantOptionCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Deluxe',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly variantId!: string;

  @IsOptional()
  readonly createdBy?: any;
}