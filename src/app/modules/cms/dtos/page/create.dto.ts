import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ENUM_CONTENT_TYPE } from '../../const';

export class PageSectionCreateDTO {
  @ApiProperty({
    type: Number,
    required: true,
    example: 'the id of the section',
  })
  @IsNotEmpty()
  @IsString()
  sectionId!: string;

  @IsOptional()
  readonly createdBy?: any;
}

export class PageCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Page Title',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'slugified-page-title',
  })
  @IsNotEmpty()
  readonly slug!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_CONTENT_TYPE).join(' / '),
  })
  @IsNotEmpty()
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
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiProperty({
    type: [PageSectionCreateDTO],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => PageSectionCreateDTO)
  readonly sections!: PageSectionCreateDTO[];

  @IsOptional()
  readonly createdBy?: any;
}
