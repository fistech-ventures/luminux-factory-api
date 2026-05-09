import { ApiProperty } from '@nestjs/swagger';
import { IAuthUser } from '@src/app/interfaces';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ENUM_CAMPAIGN_FORM_STATUS, ENUM_CAMPAIGN_FORM_TYPE } from '../../enums';
import { FormStructureDTO } from './formStructure.dto';

export class CreateFormDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'FORM001',
    description: 'Unique code for the campaign form',
  })
  @IsOptional()
  @IsString()
  readonly code?: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Customer Feedback Form',
    description: 'Title of the campaign form',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'customer-feedback-form',
    description: 'URL slug for the form',
  })
  @IsOptional()
  @IsString()
  readonly slug?: string;

  @ApiProperty({
    type: Date,
    required: false,
    example: new Date('2024-12-31'),
    description: 'Date until which the form is valid',
  })
  @IsOptional()
  @IsDateString()
  readonly validUntil?: Date;

  @ApiProperty({
    enum: ENUM_CAMPAIGN_FORM_TYPE,
    required: false,
    description: 'Type of the campaign form',
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_CAMPAIGN_FORM_TYPE)
  readonly formType?: ENUM_CAMPAIGN_FORM_TYPE;

  @ApiProperty({
    enum: ENUM_CAMPAIGN_FORM_STATUS,
    required: false,
    description: 'Form status',
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_CAMPAIGN_FORM_STATUS)
  readonly status?: ENUM_CAMPAIGN_FORM_STATUS;

  @ApiProperty({
    type: FormStructureDTO,
    required: false,
    description: 'JSON structure defining the form fields and layout',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormStructureDTO)
  readonly formStructure?: FormStructureDTO;

  @IsOptional()
  readonly createdBy?: IAuthUser;
}
