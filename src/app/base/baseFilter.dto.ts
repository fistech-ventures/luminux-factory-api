import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  isUUID,
} from 'class-validator';
import { IsUUIDArray } from '../decorators';
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class BaseFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'The page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number = 1;

  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number = 10;

  @ApiProperty({ required: false })
  @IsBooleanString()
  @IsOptional()
  isActive: boolean;

  @ApiProperty({
    type: String,
    description: 'The search term',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: String,
    description: 'Format (YYYY-MM-DD): ' + new Date().toISOString().split('T')[0],
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate!: string;

  @ApiProperty({
    type: String,
    description: 'Format (YYYY-MM-DD): ' + new Date().toISOString().split('T')[0],
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate!: string;

  @ApiProperty({
    type: String,
    description: 'createdAt',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy!: string;

  @ApiProperty({
    type: String,
    description: 'ASC/DESC',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder!: SortOrder;

  @ApiProperty({
    type: String,
    required: false,
    description: JSON.stringify(['uid', 'uid']),
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      const data = JSON.parse(value);
      return data.map((item: any) => {
        const id = item?.toString();
        if (!isUUID(id)) {
          throw new Error('Invalid UUID in initialLoadIds');
        }
        return id;
      });
    } catch {
      throw new Error('Invalid JSON in initialLoadIds');
    }
  })
  @IsUUIDArray()
  readonly initialLoadIds?: string[];
}

export class FilterBulkByIdsDTO {
  @ApiProperty({
    type: [String],
    description: `id array ['uuid','uuid']`,
    example: ['8ecf938a-b380-4279-8768-ed7743eb6f70'],
    default: '',
    required: true,
  })
  @IsNotEmpty()
  @IsUUIDArray()
  ids!: string[];
}
