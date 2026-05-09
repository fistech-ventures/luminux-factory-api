import { ApiProperty } from '@nestjs/swagger';
import { ENUM_PAYMENT_GATEWAY_TYPE } from '@src/app/modules/payment-gateway/enums';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ENUM_DELIVERY_ZONE, ENUM_ORDER_SOURCE, ENUM_PANEL } from '../../const';
import { IAuthUser } from '@src/app/interfaces';

export class OrderQuickCreateProductDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: any;

  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  readonly variantOptionId!: any;

  @ApiProperty({
    type: Number,
    required: true,
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly quantity!: number;
}

export class OrderCreateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'user uuid',
  })
  @IsOptional()
  @IsString()
  readonly customerId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'address uuid',
  })
  @IsNotEmpty()
  @IsString()
  readonly addressId!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 100,
  })
  @IsOptional()
  deliveryCharge!: number;

  @ApiProperty({
    type: String,
    required: false,
    example: 'flat/percentage',
  })
  @IsOptional()
  discountType!: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 100,
  })
  @IsOptional()
  discountAmount!: number;

  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_ORDER_SOURCE).join(' / '),
  })
  @IsNotEmpty()
  @IsEnum(ENUM_ORDER_SOURCE)
  @IsString()
  readonly source!: string;

  // @ApiProperty({
  //   type: String,
  //   required: false,
  //   example: Object.values(ENUM_PANEL).join(' / '),
  // })
  @IsOptional()
  @IsEnum(ENUM_PANEL)
  @IsString()
  panel!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Oka',
  })
  @IsOptional()
  @IsString()
  readonly pasteBoard!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'note from customer related to order/delivery/special request etc',
  })
  @IsOptional()
  @IsString()
  readonly customerInstruction!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  readonly sendAsGift!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'user uuid',
  })
  @IsOptional()
  @IsString()
  readonly salesPersonId!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: {
      id: "string",
      email: "string",
      fullName: "string",
      phoneNumber: "string",
      roles: []
    },
  })
  @IsOptional()
  @IsString()
  readonly salesPerson!: IAuthUser;

  @IsOptional()
  readonly createdBy?: any;
}

export class OrderQuickCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'A H Jubayer Khan',
  })
  @IsNotEmpty()
  @IsString()
  readonly customerName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '8801312458778',
  })
  @IsNotEmpty()
  @IsString()
  readonly customerPhoneNumber!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'jubayer@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly customerEmail?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
    description: 'If true, will create user account and send password via email'
  })
  @IsOptional()
  readonly createAccount?: boolean;

  @ApiProperty({
    type: String,
    required: true,
    example: '119 Khan Villa, Arman Khan Goli, 9/A West Dhanmondi',
  })
  @IsNotEmpty()
  @IsString()
  readonly addressLine!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Oka',
  })
  @IsOptional()
  @IsString()
  readonly pasteBoard!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'note from customer related to order/delivery/special request etc',
  })
  @IsOptional()
  @IsString()
  readonly customerInstruction!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  readonly sendAsGift!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_DELIVERY_ZONE).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_DELIVERY_ZONE)
  @IsString()
  readonly deliveryZone!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'area id',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  readonly areaId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_PAYMENT_GATEWAY_TYPE).join(' / '),
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_GATEWAY_TYPE)
  @IsString()
  readonly paymentMethod!: string;

  @IsOptional()
  @IsString()
  source!: string;

  @IsOptional()
  @IsString()
  panel!: string;

  @ApiProperty({
    type: [OrderQuickCreateProductDTO],
    required: true,
  })
  @ValidateNested({ each: true })
  @Type(() => OrderQuickCreateProductDTO)
  @IsOptional()
  readonly products!: OrderQuickCreateProductDTO[];

  @IsOptional()
  readonly createdBy?: any;
}
export class OrderMakePaymentDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  readonly paymentGatewayId!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly paymentAccountId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'txn from payment gateway -> bkash',
  })
  @IsOptional()
  readonly txnCode!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'bank accountNo/bkashNo/cash/cardNo',
  })
  @IsOptional()
  readonly txnSource!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'xyz payment note',
  })
  @IsOptional()
  readonly paymentNote!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 200,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount!: number;

  @IsOptional()
  readonly createdBy?: any;
}
