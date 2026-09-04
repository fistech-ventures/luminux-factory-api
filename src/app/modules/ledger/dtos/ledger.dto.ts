import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsString, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';

export class CreateLedgerDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  entityType: string;

  @IsNotEmpty()
  @IsString()
  entityId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  type: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Date)
  transactionDate: Date;
}

export class UpdateLedgerDTO extends PartialType(CreateLedgerDTO) {}

export class FilterLedgerDTO extends BaseFilterDTO {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
