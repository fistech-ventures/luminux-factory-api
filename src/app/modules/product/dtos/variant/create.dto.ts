import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray } from '@src/app/decorators';
import { Type } from 'class-transformer';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

class VariantCreateOptionDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Deluxe',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @IsOptional()
  readonly createdBy?: any;
}

export class VariantCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Edition',
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
    type: [VariantCreateOptionDTO],
    required: true,
  })
  @ValidateNested()
  @Type(() => VariantCreateOptionDTO)
  @IsNotEmpty()
  @IsNotEmptyArray()
  readonly options!: VariantCreateOptionDTO[];

  @IsOptional()
  readonly createdBy?: any;
}