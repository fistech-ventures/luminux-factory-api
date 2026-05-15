import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ENUM_OFFER_TAG } from '../../const';
import { CreateDiscountRuleDto } from '../discount-rule/create.dto';
import { CreateOfferScopeDto } from '../offer-scope/create.dto';

export class UpdateOfferDto {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Winter Flash Sale',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'winter-flash-sale',
  })
  @IsOptional()
  @IsString()
  readonly slug?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://example.com/banners/winter-sale.jpg',
  })
  @IsOptional()
  @IsString()
  readonly banner?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Special discount for winter collection',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'FLASH_SALE',
    enum: Object.values(ENUM_OFFER_TAG),
  })
  @IsOptional()
  @IsEnum(ENUM_OFFER_TAG)
  readonly tag?: string;

  @ApiProperty({
    type: Date,
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly startsAt?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly endsAt?: Date;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiProperty({
    type: Number,
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  readonly priority?: number;

  @ApiProperty({
    type: [CreateDiscountRuleDto],
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateDiscountRuleDto)
  @IsOptional()
  readonly rules?: CreateDiscountRuleDto[];

  @ApiProperty({
    type: [CreateOfferScopeDto],
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateOfferScopeDto)
  @IsOptional()
  readonly scopes?: CreateOfferScopeDto[];

  @IsOptional()
  readonly updatedBy?: any;
}
