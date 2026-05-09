import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateFormSubmitDTO } from './create.dto';

export class UpdateFormSubmitDTO extends PartialType(OmitType(CreateFormSubmitDTO, ['createdBy'])) {
  @IsOptional()
  readonly updatedBy!: any;
}
