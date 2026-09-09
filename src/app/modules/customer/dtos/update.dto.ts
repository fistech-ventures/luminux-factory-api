import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ENUM_CUSTOMER_TYPES } from '@src/shared';

export class UpdateCustomerDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_CUSTOMER_TYPES,
    example: ENUM_CUSTOMER_TYPES.B2C,
  })
  @IsOptional()
  @IsEnum(ENUM_CUSTOMER_TYPES)
  customerType?: ENUM_CUSTOMER_TYPES;

  @ApiProperty({
    type: String,
    required: false,
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '123 Main St, City, State, ZIP',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'ABC Company',
  })
  @IsOptional()
  @IsString()
  companyName?: string;
  
  @IsOptional()
  readonly updatedBy?: any;
}
