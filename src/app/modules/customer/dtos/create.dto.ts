import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
