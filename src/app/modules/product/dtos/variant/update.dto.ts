import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

class UpdateAssessmentQuestionOptionDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  readonly id!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Second',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted?: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}

export class VariantUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Format',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiProperty({
    type: [UpdateAssessmentQuestionOptionDTO],
    required: true,
  })
  @ValidateNested()
  @Type(() => UpdateAssessmentQuestionOptionDTO)
  @IsOptional()
  readonly options!: UpdateAssessmentQuestionOptionDTO[];

  @IsOptional()
  readonly updatedBy?: any;
}