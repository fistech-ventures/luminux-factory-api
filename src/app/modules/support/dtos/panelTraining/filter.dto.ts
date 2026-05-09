import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsNumberString, IsOptional } from 'class-validator';

export class PanelTrainingFilterDTO extends BaseFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number;

  @ApiProperty({
    type: String,
    description: 'The search term',
    default: '',
    required: false,
  })
  @IsOptional()
  readonly searchTerm!: string;

  @ApiProperty({
    type: String,
    description: 'module',
    required: false,
  })
  @IsOptional()
  readonly module!: string;
}
