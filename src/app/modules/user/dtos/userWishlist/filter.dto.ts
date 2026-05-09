import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class UserWishlistFilterDTO extends BaseFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly limit: number = 10;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly page: number = 1;

  @ApiProperty({
    type: String,
    description: 'The search term',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'user Id',
  })
  @IsOptional()
  @IsString()
  userId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  isDefault?: boolean;
}
