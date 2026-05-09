import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FeedbackCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Payment received but tracking not generated!',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Assessment',
  })
  @IsNotEmpty()
  @IsString()
  readonly module!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'explain',
  })
  @IsOptional()
  @IsString()
  readonly description!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: ['video url', 'image url'],
  })
  @IsOptional()
  @IsArray()
  readonly attachments!: string[];

  @ApiProperty({
    type: String,
    required: true,
    example: 'P0/P1/P2/P3',
  })
  @IsOptional()
  readonly priority!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @IsOptional()
  readonly createdBy?: any;
}
