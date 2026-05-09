import { ApiProperty } from '@nestjs/swagger';

import { ENUM_BLOOD_GROUP, ENUM_GENDER } from '@src/shared/enums/common.enums';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength
} from 'class-validator';

export class UserMembershipUpdateDTO {
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fullName input / autofill from user',
  })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'emon@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '8801998200160',
  })
  @IsOptional()
  @IsString()
  @MinLength(11)
  @MaxLength(13)
  readonly phoneNumber: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly isThisWhatsAppNumber?: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'avatar url',
  })
  @IsOptional()
  @IsUrl()
  readonly image!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '1997-11-19',
  })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_GENDER,
    example: ENUM_GENDER.MALE,
  })
  @IsOptional()
  @IsEnum(ENUM_GENDER)
  gender!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_BLOOD_GROUP,
    example: ENUM_BLOOD_GROUP.A_POSITIVE,
  })
  @IsOptional()
  @IsEnum(ENUM_BLOOD_GROUP)
  readonly bloodGroup!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly highlightOnBirthday?: boolean;

  @ApiProperty({
    type: String,
    required: false,
    description: 'user Id',
  })
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  readonly updatedBy?: any;
}
