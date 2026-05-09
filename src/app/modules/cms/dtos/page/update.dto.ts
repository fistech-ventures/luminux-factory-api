import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { ENUM_CONTENT_TYPE } from '../../const';

export class PageSectionUpdateDTO {
  @ApiProperty({
    type: Number,
    required: false,
    example: 'the id of the section',
  })
  @IsOptional()
  sectionId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  isDeleted!: boolean;

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @ValidateIf((o) => o.isDeleted)
  id!: string;

  @IsOptional()
  readonly updatedBy?: any;
}

export class PageUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Terms and Conditions',
  })
  @IsOptional()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'slugified-page-title',
  })
  @IsOptional()
  readonly slug!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_CONTENT_TYPE).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_CONTENT_TYPE)
  readonly contentType!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Rich text content goes here...',
  })
  @IsOptional()
  readonly content!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isActive!: boolean;

  @ApiProperty({
    type: [PageSectionUpdateDTO],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => PageSectionUpdateDTO)
  readonly sections!: PageSectionUpdateDTO[];

  @IsOptional()
  readonly updatedBy?: any;
}
