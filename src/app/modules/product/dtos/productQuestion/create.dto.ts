import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class ProductQuestionCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Is it a good book?',
  })
  @IsNotEmpty()
  @IsString()
  readonly statement!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'product uuid',
  })
  @IsNotEmpty()
  @IsString()
  readonly productId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  source!: string;

  @IsOptional()
  readonly createdBy?: any;
}