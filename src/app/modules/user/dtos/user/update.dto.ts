import { ApiProperty } from '@nestjs/swagger';
import { ENUM_GENDER } from '@src/shared/enums/common.enums';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class UpdateRolesDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly role!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted!: boolean;
}

export class UpdateUserDTO {
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
    example: '01636476123',
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '123456',
  })
  @IsOptional()
  @IsString()
  readonly password!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  readonly avatar!: string;

  @ApiProperty({
    type: [UpdateRolesDTO],
    required: false,
    example: [
      {
        role: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
      },
      {
        role: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
        isDeleted: true,
      },
    ],
  })
  @ValidateNested()
  @Type(() => UpdateRolesDTO)
  @IsOptional()
  roles!: UpdateRolesDTO[];

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}

export class UserRoleAssignOrRemoveDTO {
  @ApiProperty({
    type: [UpdateRolesDTO],
    required: false,
    example: [
      {
        role: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
      },
      {
        role: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
        isDeleted: true,
      },
    ],
  })
  @ValidateNested()
  @Type(() => UpdateRolesDTO)
  @IsOptional()
  readonly roles!: UpdateRolesDTO[];

  @IsOptional()
  readonly updatedBy?: any;
}
