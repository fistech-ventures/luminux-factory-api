import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupplierDTO {
  @ApiProperty({
    required: true,
    name: 'companyName',
    example: 'ABC Company',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  companyName: string;

  @ApiProperty({
    required: false,
    name: 'contactPerson',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiProperty({
    required: true,
    name: 'contactNumber',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  contactNumber: string;

  @ApiProperty({
    required: false,
    name: 'email',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({
    required: false,
    name: 'address',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  readonly createdBy: string;
}
