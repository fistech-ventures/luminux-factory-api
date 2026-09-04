import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupplierDTO {
  @ApiProperty({
    name: 'companyName',
    example: 'ABC Company',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName: string;

  @ApiProperty({
    name: 'contactPerson',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson: string;

  @ApiProperty({
    name: 'contactNumber',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactNumber: string;

  @ApiProperty({
    name: 'email',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({
    name: 'address',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  address: string;
  
  @IsOptional()
  readonly updatedBy: string;
}

