import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ENUM_CONTACT_STATUS, ENUM_CONTACT_TYPE } from '../enums';

export class ContactCreateDTO {
  @ApiProperty({ type: String, required: true, example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({ type: String, required: true, example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ type: String, required: true, example: 'Product inquiry' })
  @IsNotEmpty()
  @IsString()
  readonly subject!: string;

  @ApiProperty({ type: String, required: true, example: 'I have a question about...' })
  @IsNotEmpty()
  @IsString()
  readonly message!: string;

  @ApiProperty({ type: String, required: true, enum: ENUM_CONTACT_TYPE, example: ENUM_CONTACT_TYPE.QUERY })
  @IsNotEmpty()
  @IsEnum(ENUM_CONTACT_TYPE)
  readonly type!: string;

  @ApiProperty({ type: String, required: false, enum: ENUM_CONTACT_STATUS, example: ENUM_CONTACT_STATUS.PENDING })
  @IsOptional()
  @IsEnum(ENUM_CONTACT_STATUS)
  readonly status?: string;

  @IsOptional()
  readonly createdBy?: any;
}
