import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator';

export class ProductReviewCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Extra ordinary, mind blowing service. Amazing Packaging. Efficient communication',
  })
  @IsNotEmpty()
  @IsString()
  readonly statement!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(5)
  @Min(1)
  readonly rating!: number;

  @ApiProperty({
    type: String,
    required: false,
    example: 'uuid',
  })
  @IsOptional()
  // @IsUUID()
  readonly orderId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly productId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['image1', 'image2', 'video1'],
  })
  @IsOptional()
  @IsArray()
  readonly attachments!: string[];

  @IsOptional()
  readonly createdBy?: any;

  @IsOptional()
  source!: string;
}