import { ApiProperty } from '@nestjs/swagger';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { ENUM_PAYMENT_STATUS } from '@src/shared/enums/common.enums';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UserInvoiceFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  readonly limit: number;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  readonly page: number;

  @ApiProperty({
    type: String,
    description: 'The search term',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @IsOptional()
  isActive!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_STATUS,
    description: Object.values(ENUM_PAYMENT_STATUS).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_STATUS)
  readonly paymentStatus!: string;

  // @ApiProperty({
  //   type: Date,
  //   required: false,
  //   example: new Date(),
  // })
  // @IsOptional()
  // @IsDateString()
  // startDate!: Date;

  // @ApiProperty({
  //   type: Date,
  //   required: false,
  //   example: new Date(),
  // })
  // @IsOptional()
  // @IsDateString()
  // endDate!: Date;

  @ApiProperty({
    type: String,
    required: false,
    description: 'user uuid',
  })
  @IsOptional()
  readonly userId!: string;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_ACL_DEFAULT_ROLES)
      .filter(
        (role) =>
          role !== ENUM_ACL_DEFAULT_ROLES.SUPER_ADMIN && role !== ENUM_ACL_DEFAULT_ROLES.INTERNAL,
      )
      .join(' / '),
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly userProfileType?: string;
}
