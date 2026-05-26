import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ENUM_CONTACT_STATUS, ENUM_CONTACT_TYPE } from '../enums';

export class ContactUpdateDTO {
  @ApiProperty({ type: String, required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({ type: String, required: false, example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ type: String, required: false, example: 'Product inquiry' })
  @IsOptional()
  @IsString()
  readonly subject!: string;

  @ApiProperty({ type: String, required: false, example: 'I have a question about...' })
  @IsOptional()
  @IsString()
  readonly message!: string;

  @ApiProperty({ type: String, required: false, enum: ENUM_CONTACT_TYPE, example: ENUM_CONTACT_TYPE.QUERY })
  @IsOptional()
  @IsEnum(ENUM_CONTACT_TYPE)
  readonly type!: string;

  @ApiProperty({ type: String, required: false, enum: ENUM_CONTACT_STATUS, example: ENUM_CONTACT_STATUS.RESOLVED })
  @IsOptional()
  @IsEnum(ENUM_CONTACT_STATUS)
  readonly status!: string;

  @IsOptional()
  readonly updatedBy?: any;
}
