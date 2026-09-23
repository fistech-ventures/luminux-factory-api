import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetLedgerStatementDTO {
  @ApiProperty({
    type: String,
    required: true,
    enum: ['customer', 'supplier', 'employee'],
    example: 'customer',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['customer', 'supplier', 'employee'])
  entityType: 'customer' | 'supplier' | 'employee';

  @ApiProperty({
    type: String,
    required: true,
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
