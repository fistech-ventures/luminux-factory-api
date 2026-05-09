import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHOD } from '../../enums';

export class UpdateTransactionDTO {
  @ApiProperty({
    type: Number,
    required: true,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  readonly amount!: any;

  // @ApiProperty({
  //   type: String,
  //   required: true,
  //   example: ENUM_PAYMENT_METHOD_CATEGORY.CASH,
  //   description: Object.values(ENUM_PAYMENT_METHOD_CATEGORY).join(' / '),
  // })
  // @IsOptional()
  // @IsString()
  // readonly paymentMethodCategory!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: ENUM_PAYMENT_METHOD.CASH,
    description: Object.values(ENUM_PAYMENT_METHOD).join(' / '),
  })
  @IsOptional()
  @IsString()
  readonly paymentMethod!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'TR1000001',
    description: 'TR1000001',
  })
  @IsOptional()
  @IsString()
  readonly trackId!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'VT-2310220372',
    description: 'VT-2310220372',
  })
  @IsOptional()
  @IsString()
  readonly applicationCode!: any;

  @ApiProperty({
    type: Number,
    required: true,
    example: '1',
    description: '1',
  })
  @IsOptional()
  @IsNumber()
  readonly application!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Some Note',
    description: 'Some Note',
  })
  @IsOptional()
  @IsString()
  readonly note!: any;

  @IsOptional()
  @IsNumber()
  readonly updatedBy!: any;
}
