import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReviewUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Extra ordinary, mind blowing service. Amazing Packaging. Efficient communication',
  })
  @IsOptional()
  @IsString()
  readonly statement!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Product/Service/Seller/Support',
  })
  @IsOptional()
  @IsString()
  readonly segment!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Max(5)
  @Min(1)
  readonly rating!: number;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['image1', 'image2', 'video1'],
  })
  @IsOptional()
  @IsArray()
  readonly attachments!: string[];

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