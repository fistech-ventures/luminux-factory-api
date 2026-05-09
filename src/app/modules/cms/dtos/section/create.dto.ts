import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ENUM_SECTION_AREA, ENUM_SECTION_LAYOUT, ENUM_SECTION_TYPE } from '../../const';

export class SectionItemCreateDTO {
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

  @IsOptional()
  readonly createdBy?: any;
}

export class SectionCreateDTO {
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Fund Raise',
  })
  @IsNotEmpty()
  @IsString()
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
  readonly type!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_SECTION_LAYOUT).join(' / '),
  })
  @IsOptional()
  readonly layout!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_SECTION_AREA).join(' / '),
  })
  @IsOptional()
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
    type: [SectionItemCreateDTO],
    required: false,
  })
  @IsOptional()
  @Type(() => SectionItemCreateDTO)
  readonly items!: SectionItemCreateDTO[];

  @IsOptional()
  readonly createdBy?: any;
}
