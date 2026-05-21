import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class HeroBannerUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Discover Our New Collection',
  })
  @IsOptional()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'We offer a wide range of books for all ages and interests.',
  })
  @IsOptional()
  readonly description!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'https://stg.fibonaccibookshop.com/images/banner.jpg',
  })
  @IsOptional()
  readonly url!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'https://bongdoodles.fibonaccibooks.com',
  })
  @IsOptional()
  readonly redirectUrl!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
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
