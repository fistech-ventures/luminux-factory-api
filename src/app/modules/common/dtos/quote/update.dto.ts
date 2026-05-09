import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QuoteUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'George R.R. Martin',
  })
  @IsOptional()
  @IsString()
  readonly author!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A reader lives a thousand lives before he dies.',
  })
  @IsOptional()
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
  readonly updatedBy?: any;
}
