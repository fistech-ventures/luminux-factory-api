import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { ENUM_SECTION_AREA, ENUM_SECTION_LAYOUT, ENUM_SECTION_TYPE } from '../../const';

export class SectionItemUpdateDTO {
  @ApiProperty({
    type: Number,
    required: false,
    example: 2,
  })
  @IsOptional()
  position!: number;

  @ApiProperty({
    type: String,
    required: false,
    example: "product uuid",
  })
  @IsOptional()
  productId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: "genre uuid",
  })
  @IsOptional()
  genreId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: "author uuid",
  })
  @IsOptional()
  authorId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: "category uuid",
  })
  @IsOptional()
  categoryId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: "gallery uuid",
  })
  @IsOptional()
  mediaId!: string;

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


export class SectionUpdateDTO {
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isActive!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Fund Raise',
  })
  @IsOptional()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Get to know how much one worth',
  })
  @IsOptional()
  readonly subTitle!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://adtravelbd.com / category/fund-raise',
  })
  @IsOptional()
  readonly redirectTo!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://adtravelbd.com/banner.jpg',
  })
  @IsOptional()
  readonly banner!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isDefaultHomeSection!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_SECTION_TYPE).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_SECTION_TYPE)
  readonly type!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_SECTION_LAYOUT).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_SECTION_LAYOUT)
  readonly layout!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_SECTION_AREA).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_SECTION_AREA)
  readonly area!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: { filter: "trending", category: "news" },
  })
  @IsOptional()
  readonly config!: any;

  @ApiProperty({
    type: String,
    required: false,
    example: "page uuid",
  })
  @IsOptional()
  readonly pageId!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 2,
  })
  @IsOptional()
  readonly position!: number;

  @ApiProperty({
    type: [SectionItemUpdateDTO],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => SectionItemUpdateDTO)
  readonly items!: SectionItemUpdateDTO[];

  @IsOptional()
  readonly updatedBy?: any;
}
