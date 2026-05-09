import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { ENUM_BLOOD_GROUP, ENUM_GENDER } from '@src/shared/enums/common.enums';
import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UserProfileFilterDTO extends BaseFilterDTO {
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
  readonly userId!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'user Id',
  })
  @IsOptional()
  @IsString()
  readonly createdById!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'profession Id',
  })
  @IsOptional()
  @IsString()
  readonly professionId!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'residentCountry Id',
  })
  @IsOptional()
  @IsString()
  readonly residentCountryId!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'citizenOf Id',
  })
  @IsOptional()
  @IsString()
  readonly citizenOfId!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'skill Id',
  })
  @IsOptional()
  @IsString()
  skillId!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_GENDER,
  })
  @IsOptional()
  @IsEnum(ENUM_GENDER)
  gender!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_BLOOD_GROUP,
  })
  @IsOptional()
  @IsEnum(ENUM_BLOOD_GROUP)
  readonly bloodGroup!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  isVerified?: boolean;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'years of experience',
  })
  @IsOptional()
  @IsString()
  readonly yearsOfExperience!: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Max age like -> 30',
  })
  @IsOptional()
  @IsString()
  maxAge!: number;
}
