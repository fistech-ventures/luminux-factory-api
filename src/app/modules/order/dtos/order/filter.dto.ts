import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ENUM_DELIVERY_URGENCY, ENUM_DELIVERY_ZONE, ENUM_INTERNAL_ORDER_STATUS, ENUM_ORDER_PAYMENT_STATUS, ENUM_ORDER_SOURCE, ENUM_PRIORITY } from '../../const';

export class OrderFilterDTO {
  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  readonly page: number = 1;

  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  readonly limit: number = 10;

  @ApiProperty({
    type: String,
    description: 'The search term',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm!: string;

  @ApiProperty({
    type: String,
    description: new Date().toString(),
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate!: string;

  @ApiProperty({
    type: String,
    description: new Date().toString(),
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate!: string;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_INTERNAL_ORDER_STATUS).join(' / '),
    required: false,
  })
  @IsOptional()
  readonly status!: string;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_ORDER_PAYMENT_STATUS).join(' / '),
    required: false,
  })
  @IsOptional()
  readonly paymentStatus!: string;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_ORDER_SOURCE).join(' / '),
    required: false,
  })
  @IsOptional()
  readonly source!: string;

  @ApiProperty({
    type: String,
    description: 'customer user uuid',
    required: false,
  })
  @IsOptional()
  userId!: string;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_DELIVERY_ZONE).join(' / '),
    required: false,
  })
  @IsOptional()
  readonly deliveryZone!: string;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_DELIVERY_URGENCY).join(' / '),
    required: false,
  })
  @IsOptional()
  readonly deliveryUrgency!: string;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_PRIORITY).join(' / '),
    required: false,
  })
  @IsOptional()
  readonly priority!: string;

  @ApiProperty({
    type: String,
    description: 'delivery Partner uuid',
    required: false,
  })
  @IsOptional()
  deliveryPartnerId!: string;
}
