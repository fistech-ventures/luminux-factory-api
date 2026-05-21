import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QuickRegistrationDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'A H Jubayer Khan',
  })
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '8801312458778',
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'jubayer@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'web',
    description: 'Source of registration: web, mobile, admin'
  })
  @IsOptional()
  @IsString()
  readonly source?: string;
}
