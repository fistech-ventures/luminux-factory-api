import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray } from '@src/app/decorators';
import { IAuthUser } from '@src/app/interfaces';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { FormSubmissionFieldDTO } from './formSubmits.dto';

export class CreateFormSubmitDTO {
  @ApiProperty({
    type: [FormSubmissionFieldDTO],
    required: true,
    example: [{ fieldName: 'name', value: 'Galib', fieldLabel: 'Name' }],
    description: 'Submitted form field values',
  })
  @IsNotEmpty()
  @IsArray()
  @IsNotEmptyArray()
  @ValidateNested({ each: true })
  @Type(() => FormSubmissionFieldDTO)
  readonly submits!: FormSubmissionFieldDTO[];

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly formId?: string;

  @IsOptional()
  readonly createdBy?: IAuthUser;
}
