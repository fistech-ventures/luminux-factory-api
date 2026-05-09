import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export enum ENUM_FORM_COMPONENT_TYPE {
  TEXT_INPUT = 'TEXT_INPUT',
  EMAIL_INPUT = 'EMAIL_INPUT',
  TEXTAREA = 'TEXTAREA',
  NUMBER_INPUT = 'NUMBER_INPUT',
  SELECT_DROPDOWN = 'SELECT_DROPDOWN',
  RADIO_GROUP = 'RADIO_GROUP',
  CHECKBOX = 'CHECKBOX',
  DATE_PICKER = 'DATE_PICKER',
  TIME_PICKER = 'TIME_PICKER',
  DATETIME_PICKER = 'DATETIME_PICKER',
  FILE_UPLOAD = 'FILE_UPLOAD',
}

export class FormConditionDTO {
  @ApiProperty({
    type: Number,
    required: true,
    example: 1753089611528,
    description: 'Unique identifier for the condition',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly id!: number;

  @ApiProperty({
    type: String,
    required: true,
    example: 'radioGroup',
    description: 'Name of the parent field that triggers this condition',
  })
  @IsNotEmpty()
  @IsString()
  readonly parentField!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Option 1',
    description: 'Expected value that triggers this condition',
  })
  @IsNotEmpty()
  @IsString()
  readonly expectedValue!: string;
}

export class FormComponentDTO {
  @ApiProperty({
    enum: ENUM_FORM_COMPONENT_TYPE,
    required: true,
    example: ENUM_FORM_COMPONENT_TYPE.TEXTAREA,
    description: 'Type of the form component',
  })
  @IsNotEmpty()
  @IsEnum(ENUM_FORM_COMPONENT_TYPE)
  readonly enum!: ENUM_FORM_COMPONENT_TYPE;

  @ApiProperty({
    type: String,
    required: true,
    example: 'textArea',
    description: 'Unique name identifier for the component',
  })
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '32541dfgd5f4g4df',
    description: 'id',
  })
  @IsNotEmpty()
  @IsString()
  readonly id!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Text Area',
    description: 'Label for the component',
  })
  @IsNotEmpty()
  @IsString()
  readonly label!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Enter component description',
    description: 'Description text for the component',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Enter value...',
    description: 'Placeholder text for input components',
  })
  @IsOptional()
  @IsString()
  readonly placeholder?: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 1,
    description: 'Order sequence of the component in the form',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly sequence!: number;

  @ApiProperty({
    type: Boolean,
    required: true,
    example: false,
    description: 'Whether the component is required for form submission',
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly required!: boolean;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['Option 1', 'Option 2'],
    description: 'Array of options for select/radio/checkbox components',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly options?: string[];

  @ApiProperty({
    type: [FormConditionDTO],
    required: false,
    description: 'Conditional logic for showing/hiding this component',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormConditionDTO)
  readonly conditions?: FormConditionDTO[];

  @ApiProperty({
    type: Number,
    required: false,
    example: 5,
    description: 'Maximum file size in MB for file upload components',
  })
  @IsOptional()
  @IsNumber()
  readonly maxFileSize?: number;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['image/*', '.pdf', '.doc', '.docx'],
    description: 'Allowed file types for file upload components',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly allowedFileTypes?: string[];

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
    description: 'Allow multiple file uploads',
  })
  @IsOptional()
  @IsBoolean()
  readonly multiple?: boolean;
}

export class FormHeaderDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Untitled Form',
    description: 'Title of the form',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Form description goes here',
    description: 'Description of the form',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://sgp1.digitaloceanspaces.com/unispaces/development/images/1753088879804.png',
    description: 'URL of the banner image for the form',
  })
  @IsOptional()
  @IsUrl()
  readonly bannerImageUrl?: string;
}

export class FormStructureDTO {
  @ApiProperty({
    type: FormHeaderDTO,
    required: true,
    description: 'Header information for the form',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => FormHeaderDTO)
  readonly header!: FormHeaderDTO;

  @ApiProperty({
    type: [FormComponentDTO],
    required: true,
    description: 'Array of form components',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormComponentDTO)
  readonly components!: FormComponentDTO[];
}
