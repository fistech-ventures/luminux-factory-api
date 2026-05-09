import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumberString, IsOptional, IsString } from 'class-validator';

export class PaymentGatewayFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number;

  @ApiProperty({
    type: String,
    description: 'The search term',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    description: 'public visibility status',
  })
  @IsOptional()
  @IsBoolean()
  readonly visibleToPublic!: boolean;
}
