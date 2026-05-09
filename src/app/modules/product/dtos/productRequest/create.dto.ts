import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class ProductRequestCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'A A Maruf',
  })
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '8801312784889',
  })
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isThisWhatsAppNumber: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'product title - source link - book publication - book author etc.',
  })
  @IsOptional()
  @IsString()
  readonly note!: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['image1', 'image2', 'video1'],
  })
  @IsOptional()
  @IsArray()
  readonly attachments!: string[];

  @ApiProperty({
    type: String,
    required: false,
    example: 'product title - source link - book publication - book author etc.',
  })
  @IsOptional()
  @IsString()
  readonly reference!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '119 Khan Villa, 9/A West Dhanmondi, Dhaka',
  })
  @IsOptional()
  @IsString()
  readonly addressDetails!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'uuid',
  })
  @IsOptional()
  readonly productId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'uuid',
  })
  @IsOptional()
  readonly userId!: string;

  @IsOptional()
  readonly createdBy?: any;
}