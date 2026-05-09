import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FeedbackUpdateDTO {
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
    example: ['video url', 'image url'],
  })
  @IsOptional()
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
  readonly updatedBy?: any;
}
