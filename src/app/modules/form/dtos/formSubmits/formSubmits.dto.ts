import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FormSubmissionFieldDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'name',
    description: 'Name of the form field that was submitted',
  })
  @IsNotEmpty()
  @IsString()
  readonly fieldName!: string;

  @ApiProperty({
    required: true,
    example: 'Galib',
    description: 'Value submitted for this field',
  })
  @IsNotEmpty()
  readonly value!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Name',
    description: 'Display label of the form field',
  })
  @IsNotEmpty()
  @IsString()
  readonly fieldLabel!: string;
}
