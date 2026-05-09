import { ApiProperty } from '@nestjs/swagger';

import { ENUM_BLOOD_GROUP, ENUM_GENDER } from '@src/shared/enums/common.enums';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength
} from 'class-validator';

export class UserProfileUpdateDTO {
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fullName',
  })
  @IsOptional()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'emon@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '01998200160',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  readonly phoneNumber!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly isThisWhatsAppNumber: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'residentStatus',
  })
  @IsOptional()
  @IsString()
  readonly residentStatus!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'residentCountry Id',
  })
  @IsOptional()
  @IsString()
  readonly residentCountryId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'citizenOf Id',
  })
  @IsOptional()
  @IsString()
  readonly citizenOfId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'profession Id',
  })
  @IsOptional()
  @IsString()
  readonly professionId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'nationality',
  })
  @IsOptional()
  @IsString()
  readonly nationality!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'religion',
  })
  @IsOptional()
  @IsString()
  readonly religion!: string;

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
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiProperty({
    type: String,
    required: false,
    example: '5.6',
  })
  @IsOptional()
  @IsNumberString()
  readonly height!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  readonly weight!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  readonly liftingCapacity!: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  readonly yearsOfExperience!: number;

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
    type: String,
    required: false,
    example: 'avatar url',
  })
  @IsOptional()
  @IsUrl()
  readonly avatar!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'featureImage url',
  })
  @IsOptional()
  @IsUrl()
  readonly featureImage!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'introductionVideo',
  })
  @IsOptional()
  @IsUrl()
  readonly introductionVideo!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'address',
  })
  @IsOptional()
  @IsString()
  readonly address!: string;

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

export class UserProfileVerifyDTO {
  @ApiProperty({
    type: Boolean,
    required: true,
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly isVerified!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}
