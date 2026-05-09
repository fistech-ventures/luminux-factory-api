import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BrandCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'BASUS',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/category-icon-image.jpg',
  })
  @IsOptional()
  @IsString()
  readonly logo!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/category-banner-image.jpg',
  })
  @IsOptional()
  @IsString()
  readonly banner!: string;

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
