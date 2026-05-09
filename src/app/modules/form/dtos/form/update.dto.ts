import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateFormDTO } from './create.dto';

export class UpdateFormDTO extends PartialType(OmitType(CreateFormDTO, ['createdBy'])) {
  @IsOptional()
  readonly updatedBy!: any;
}
