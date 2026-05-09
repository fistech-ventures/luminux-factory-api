import { ApiProperty } from '@nestjs/swagger';
import { ENUM_PAYMENT_GATEWAY_TYPE } from '@src/app/modules/payment-gateway/enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';


export class PaymentGatewayCreateDTO {
  @ApiProperty({
    type: String,
    example: 'Payment gateway name',
    description: 'Payment gateway name',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: any;

  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_PAYMENT_GATEWAY_TYPE).join(' / '),
    description: Object.values(ENUM_PAYMENT_GATEWAY_TYPE).join(' / '),
  })
  @IsNotEmpty()
  @IsEnum(ENUM_PAYMENT_GATEWAY_TYPE)
  @IsString()
  readonly paymentGateway!: any;

  @ApiProperty({
    type: String,
    example: 'description',
    description: 'description',
  })
  @IsOptional()
  @IsString()
  readonly description!: any;

  @ApiProperty({
    type: String,
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
  readonly createdBy?: any;
}
