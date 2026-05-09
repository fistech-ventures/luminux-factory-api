import { ApiProperty } from '@nestjs/swagger';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { ENUM_GENDER } from '@src/shared/enums/common.enums';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'user@wh.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly email!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Zahid Hassan',
  })
  @IsOptional()
  @IsString()
  readonly fullName!: string;

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
    example: '01612345678',
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  readonly password?: string;

  @ApiProperty({
    type: [String],
    required: true,
    example: Object.values(ENUM_ACL_DEFAULT_ROLES).map((r) => r),
  })
  @IsArray()
  @IsNotEmpty()
  roles!: string[];

  @IsOptional()
  readonly createdBy?: any;
}

export class UserInstantCreateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Zahid Hassan',
  })
  @IsOptional()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '01612345678',
  })
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber?: string;

  @IsOptional()
  readonly createdBy?: any;
}
