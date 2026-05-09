import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { ENUM_BLOOD_GROUP, ENUM_GENDER } from '@src/shared/enums/common.enums';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UserMembershipFilterDTO extends BaseFilterDTO {
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
}
