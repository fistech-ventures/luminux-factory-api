import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateExpenseDTO {
  @ApiProperty({
    type: Date,
    required: false,
    example: '2025-10-09',
  })
  @IsOptional()
  date?: Date;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Office rent',
  })
  @IsOptional()
  purpose?: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 1000,
  })
  @IsOptional()
  amountSpent?: number;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Nahid',
  })
  @IsOptional()
  spentBy?: string;

  @IsOptional()
  readonly updatedBy?: string;
}
