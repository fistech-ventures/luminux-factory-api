import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthorCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Ahmed Chofa',
  })
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/author-image.jpg',
  })
  @IsOptional()
  @IsString()
  readonly image!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/author-image.jpg',
  })
  @IsOptional()
  @IsString()
  readonly featuredImage!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'author introduction from rich text editor',
  })
  @IsOptional()
  readonly introduction!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '1980-02-18',
  })
  @IsOptional()
  @IsString()
  readonly dob!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isFeaturedOnBirthday!: boolean;

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
