import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class QuoteCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Cicero',
  })
  @IsNotEmpty()
  @IsString()
  readonly author!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'A room without books is like a body without a soul.',
  })
  @IsNotEmpty()
  @IsString()
  readonly text!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://fibonaccibooks.com/background.jpg',
  })
  @IsOptional()
  @IsString()
  readonly background!: string;

  @IsOptional()
  readonly createdBy?: any;
}
