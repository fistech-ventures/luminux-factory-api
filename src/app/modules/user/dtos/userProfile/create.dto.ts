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

export class UserProfileCreateDTO {
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
    required: true,
    example: 'fullName',
  })
  @IsNotEmpty()
  @IsString()
  readonly fullName: string;

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
    required: true,
    example: '01998200160',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
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
    required: true,
    enum: ENUM_GENDER,
    example: ENUM_GENDER.MALE,
  })
  @IsNotEmpty()
  @IsEnum(ENUM_GENDER)
  gender!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: new Date().toISOString(),
  })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiProperty({
    type: String,
    required: true,
    example: '5.6',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly height!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 60,
  })
  @IsNotEmpty()
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
    required: true,
    description: 'user Id',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  readonly createdBy?: any;
}
