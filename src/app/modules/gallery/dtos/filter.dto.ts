import { ApiProperty } from '@nestjs/swagger';
// import { BaseFilterDTO } from '@src/app/base';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterGalleryDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number = 20;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number = 1;

  @ApiProperty({
    type: String,
    description: 'The search term',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;
}
