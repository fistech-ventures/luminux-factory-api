import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class AuthorUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Ahmed Chofa',
  })
  @IsOptional()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/author-image.jpg',
  })
  @IsOptional()
  readonly image!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/author-image.jpg',
  })
  @IsOptional()
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
  readonly dob!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isFeaturedOnBirthday!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isActive!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'user uuid',
  })
  @IsOptional()
  readonly userId!: string;

  @IsOptional()
  readonly updatedBy?: any;
}
