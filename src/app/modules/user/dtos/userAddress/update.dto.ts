import { ApiProperty } from '@nestjs/swagger';

import {
  IsOptional,
} from 'class-validator';

export class UserAddressUpdateDTO {
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isDefault?: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'home/office',
  })
  @IsOptional()
  readonly label: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fullName',
  })
  @IsOptional()
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
    required: false,
    example: '01998200160',
  })
  @IsOptional()
  readonly phoneNumber: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
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
    required: false,
    description: 'addressLine1',
  })
  @IsOptional()
  addressLine1: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'addressLine2',
  })
  @IsOptional()
  addressLine2: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'area Id',
  })
  @IsOptional()
  areaId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'user Id',
  })
  @IsOptional()
  userId: string;

  @IsOptional()
  readonly updatedBy?: any;
}
