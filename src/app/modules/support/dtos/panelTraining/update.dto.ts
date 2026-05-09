import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PanelTrainingUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'How to create assessment',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Assessment',
  })
  @IsOptional()
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
  readonly updatedBy?: any;
}
