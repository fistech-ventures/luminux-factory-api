import { ApiProperty } from '@nestjs/swagger';
import { ENUM_PAYMENT_GATEWAY_TYPE } from '@src/app/modules/payment-gateway/enums';
import {
  IsBoolean,
  IsOptional,
  IsString
} from 'class-validator';

export class PaymentGatewayUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Some Note',
    description: 'Some Note',
  })
  @IsOptional()
  @IsString()
  readonly title!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: ENUM_PAYMENT_GATEWAY_TYPE.SSL_COMMERZ,
    description: Object.values(ENUM_PAYMENT_GATEWAY_TYPE).join(' / '),
  })
  @IsOptional()
  @IsString()
  readonly paymentGateway!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'description',
    description: 'description',
  })
  @IsOptional()
  @IsString()
  readonly description!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Image link',
    description: 'Image link',
  })
  @IsOptional()
  @IsString()
  readonly image!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
    description: 'public visibility status',
  })
  @IsOptional()
  @IsBoolean()
  readonly visibleToPublic!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
    description: 'Active status',
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}
