import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ENUM_CUSTOMER_TYPES } from '@src/shared';

export class CreateCustomerDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: ENUM_CUSTOMER_TYPES,
    example: ENUM_CUSTOMER_TYPES.B2C,
    description: 'B2B => business customer, B2C => retail customer',
  })
  @IsNotEmpty()
  @IsEnum(ENUM_CUSTOMER_TYPES)
  customerType: ENUM_CUSTOMER_TYPES;

  @ApiProperty({
    type: String,
    required: true,
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  contactNumber: string;

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
  readonly createdBy?: any;
}
