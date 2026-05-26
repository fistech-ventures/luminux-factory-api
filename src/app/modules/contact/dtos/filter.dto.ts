import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ENUM_CONTACT_STATUS, ENUM_CONTACT_TYPE } from '../enums';

export class ContactFilterDTO {
  @ApiProperty({ type: Number, description: 'The page number', example: 1, required: false })
  @IsOptional()
  readonly page: number = 1;

  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  readonly limit: number = 10;

  @ApiProperty({ type: String, description: 'The search term', required: false })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Filter by status',
    enum: ENUM_CONTACT_STATUS,
  })
  @IsOptional()
  @IsEnum(ENUM_CONTACT_STATUS)
  readonly status!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Filter by type',
    enum: ENUM_CONTACT_TYPE,
  })
  @IsOptional()
  @IsEnum(ENUM_CONTACT_TYPE)
  readonly type!: string;

  @ApiProperty({ type: String, required: false, description: 'Filter by email' })
  @IsOptional()
  @IsString()
  readonly email!: string;
}
