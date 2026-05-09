import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHOD } from '../../enums';

export class CreateTransactionDTO {
  @ApiProperty({
    type: Number,
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: ENUM_PAYMENT_METHOD.CASH,
    description: Object.values(ENUM_PAYMENT_METHOD).join(' / '),
  })
  @IsNotEmpty()
  @IsString()
  readonly paymentMethod!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'TR1000001',
    description: 'TR1000001',
  })
  @IsNotEmpty()
  @IsString()
  readonly trackId!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'VT-2310220372',
    description: 'VT-2310220372',
  })
  @IsNotEmpty()
  @IsString()
  readonly applicationCode!: any;

  @ApiProperty({
    type: Number,
    required: true,
    example: '1',
    description: '1',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly application!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Some Note',
    description: 'Some Note',
  })
  @IsNotEmpty()
  @IsString()
  readonly note!: any;
}
