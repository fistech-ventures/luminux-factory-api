import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubCategoryCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Science Fiction',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/subcategory-icon-image.jpg',
  })
  @IsOptional()
  @IsString()
  readonly icon!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/subcategory-banner-image.jpg',
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

  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsNotEmpty()
  @IsString()
  readonly parentId!: string;

  @IsOptional()
  readonly createdBy?: any;
}
