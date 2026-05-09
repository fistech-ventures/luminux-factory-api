import { ApiProperty } from '@nestjs/swagger';
import { ENUM_PAYMENT_GATEWAY_TYPE } from '@src/app/modules/payment-gateway/enums';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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

  @IsOptional()
  readonly createdBy?: any;
}

export class PaymentRequestCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'INV2505219130',
    description: 'invoice Code',
  })
  @IsNotEmpty()
  @IsString()
  readonly invoiceCode!: string;

  @ApiProperty({ example: ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ })
  @IsEnum(ENUM_PAYMENT_GATEWAY_TYPE)
  @IsNotEmpty()
  paymentGatewayType?: ENUM_PAYMENT_GATEWAY_TYPE;

  @ApiProperty({ example: 'Origin Url', required: true })
  @IsNotEmpty()
  originUrl?: string;

  @ApiProperty({
    example: 'Web Callback Url',
    description: 'Frontend Call Back Url',
    required: true,
  })
  @IsNotEmpty()
  webCallbackUrl?: string;

  @IsOptional()
  readonly createdBy?: any;
}
