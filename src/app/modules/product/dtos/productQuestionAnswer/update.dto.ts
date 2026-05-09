import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ENUM_PRODUCT_QUESTION_ANSWER_STATUS } from '../../const';

export class ProductQuestionAnswerUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Is it a good book?',
  })
  @IsOptional()
  readonly statement!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_PRODUCT_QUESTION_ANSWER_STATUS).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_PRODUCT_QUESTION_ANSWER_STATUS)
  readonly status!: string;

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