import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class UserAddressCreateDTO {
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly isDefault?: boolean;

  @ApiProperty({
    type: String,
    required: true,
    example: 'home/office',
  })
  @IsNotEmpty()
  @IsString()
  readonly label: string;

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

  // @ApiProperty({
  //   type: String,
  //   required: false,
  //   enum: ENUM_BLOOD_GROUP,
  //   example: ENUM_BLOOD_GROUP.A_POSITIVE,
  // })
  // @IsOptional()
  // @IsEnum(ENUM_BLOOD_GROUP)
  // readonly bloodGroup!: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'addressLine1',
  })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'addressLine2',
  })
  @IsOptional()
  @IsString()
  addressLine2: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'area Id',
  })
  @IsNotEmpty()
  @IsString()
  areaId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'user Id',
  })
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  readonly createdBy?: any;
}
