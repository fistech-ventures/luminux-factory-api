import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HeroBannerCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Discover Our New Collection',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'https://stg.fibonaccibookshop.com/images/banner.jpg',
  })
  @IsNotEmpty()
  readonly url!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'https://bongdoodles.fibonaccibooks.com',
  })
  @IsNotEmpty()
  readonly redirectUrl!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 2,
  })
  @IsOptional()
  readonly position!: number;

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
