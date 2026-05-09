import { ApiProperty } from '@nestjs/swagger';
import { ENUM_PRODUCT_SEGMENT } from '@src/app/modules/product/const';
import { IsOptional } from 'class-validator';

export class MenuUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Pre Order',
  })
  @IsOptional()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'pre-order',
  })
  @IsOptional()
  readonly slug!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'icon-class-name / icon-url',
  })
  @IsOptional()
  readonly icon!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://bongdoodles.fibonaccibooks.com',
  })
  @IsOptional()
  readonly externalUrl!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'header/footer',
  })
  @IsOptional()
  readonly type!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'url-redirection/static-page/segment-data',
  })
  @IsOptional()
  readonly handles!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: { segment: ENUM_PRODUCT_SEGMENT.ACADEMIC_BOOK, category: "uuid" },
  })
  @IsOptional()
  readonly config!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isActive!: boolean;

  @ApiProperty({
    type: Number,
    required: false,
    example: 2,
  })
  @IsOptional()
  readonly position!: number;

  @ApiProperty({
    type: String,
    required: false,
    example: "page uuid",
  })
  @IsOptional()
  readonly pageId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: "parent menu uuid",
  })
  @IsOptional()
  readonly parentId!: string;

  @IsOptional()
  readonly updatedBy?: any;
}
