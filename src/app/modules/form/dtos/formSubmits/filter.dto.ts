import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterFormSubmitDTO extends BaseFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number = 10;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
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

  @ApiProperty({
    type: String,
    description: 'Slug',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly slug!: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "UUID of the form this submission belongs to",
  })
  @IsUUID()
  @IsNotEmpty()
  readonly formId?: string;
}
