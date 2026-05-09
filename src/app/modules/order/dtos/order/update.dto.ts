import { ApiProperty } from '@nestjs/swagger';
import { IsUUIDArray } from '@src/app/decorators';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ENUM_INTERNAL_ORDER_STATUS } from '../../const';

export class OrderUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'user uuid',
  })
  @IsOptional()
  readonly customerId!: string;

  @ApiProperty({
    type: Object,
    required: true,
    example: {
      id: null,
      label: null,
      fullName: 'customerName',
      phoneNumber: 'customerPhoneNumber',
      email: null,
      isThisWhatsAppNumber: false,
      addressLine1: 'addressLine1',
      addressLine2: null,
      areaId: null,
      areaTitle: null,
      // cityId: null,
      // cityTitle: null,
      deliveryChargeId: null,
      deliveryCharge: 80,
      deliveryZone: 'deliveryZone',
    },
  })
  @IsOptional()
  readonly address!: any;

  // @ApiProperty({
  //   type: String,
  //   required: true,
  //   example: Object.values(ENUM_INTERNAL_ORDER_STATUS).join(' / '),
  // })
  // @IsOptional()
  // @IsEnum(ENUM_INTERNAL_ORDER_STATUS)
  // @IsString()
  // readonly status!: string;

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
  discountType!: 'flat' | 'percentage';

  @ApiProperty({
    type: Number,
    required: false,
    example: 100,
  })
  @IsOptional()
  discountAmount!: number;

  @ApiProperty({
    type: [Object],
    required: false,
    example: [{ productId: 'product uuid', variantOptionId: 'product variant option uuid', quantity: 3 }],
  })
  @IsOptional()
  readonly addProducts!: any;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['product uuid 1', 'product uuid 2'],
  })
  @IsOptional()
  @IsUUIDArray()
  removeProductIds!: string[];

  @IsOptional()
  readonly updatedBy?: any;
}


// { operationalStatus: ENUM_INTERNAL_ORDER_STATUS; note?: string; force?: boolean }
export class OrderStatusUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_INTERNAL_ORDER_STATUS).join(' / '),
  })
  @IsNotEmpty()
  @IsEnum(ENUM_INTERNAL_ORDER_STATUS)
  @IsString()
  readonly operationalStatus!: ENUM_INTERNAL_ORDER_STATUS;

  @ApiProperty({
    type: String,
    required: false,
    example: 'note with status',
  })
  @IsOptional()
  readonly note!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'serviceProvider uuid',
  })
  @IsOptional()
  readonly serviceProviderId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  readonly force!: boolean;

  @IsOptional()
  readonly updatedBy?: any;

  @IsOptional()
  readonly createdBy?: any;
}
