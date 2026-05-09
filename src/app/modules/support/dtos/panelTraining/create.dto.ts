import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PanelTrainingCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'How to create assessment',
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
    example: 'rich text documentation like guideline',
  })
  @IsOptional()
  @IsString()
  readonly description!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'video url',
  })
  @IsOptional()
  @IsString()
  readonly video!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
  })
  @IsOptional()
  readonly priority!: number;

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
