import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CategoryUpdateDTO {
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
  readonly icon!: string;

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

  @ApiProperty({
    type: Number,
    required: false,
    example: 2,
  })
  @IsOptional()
  readonly position!: number;

  @IsOptional()
  readonly updatedBy?: any;
}
