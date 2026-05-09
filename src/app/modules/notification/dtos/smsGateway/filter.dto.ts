import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base';
import { IsNumberString, IsOptional, IsUUID } from 'class-validator';

export class SmsGatewayFilterDTO extends BaseFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number = 1;

  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number = 10;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  readonly userId!: string;
}
