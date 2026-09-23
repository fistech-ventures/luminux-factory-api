import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmployeeDTO {
  @ApiProperty({ type: String, required: false, example: 'Nahid Hasan' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ type: String, required: false, example: 'EMP-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  employeeId?: string;

  @ApiProperty({ type: String, required: false, example: '01700000000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ type: String, required: false, example: 'nahid@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({ type: String, required: false, example: 'Sales Executive' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  designation?: string;

  @IsOptional()
  readonly updatedBy?: any;
}
