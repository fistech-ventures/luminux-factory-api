import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BrandUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Books',
  })
  @IsOptional()
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
  readonly updatedBy?: any;
}
