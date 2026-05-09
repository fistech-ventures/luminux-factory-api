import { ApiProperty } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ENUM_PAYMENT_METHOD, ENUM_TRANSACTION_STATUS } from '../../enums';

export class FilterTransactionDTO {
  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBooleanString()
  isApproved?: boolean;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBooleanString()
  isForTest?: boolean;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_TRANSACTION_STATUS,
  })
  @IsOptional()
  @IsEnum(ENUM_TRANSACTION_STATUS)
  readonly status!: string;

  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number;

  @ApiProperty({
    type: String,
    description: 'The search term',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: Date,
    required: false,
    example: new Date(),
  })
  @IsOptional()
  @IsDateString()
  startDate!: Date;

  @ApiProperty({
    type: Date,
    required: false,
    example: new Date(),
  })
  @IsOptional()
  @IsDateString()
  endDate!: Date;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentGateway?: string;

  @ApiProperty({
    type: String,
    description: 'applicationCode ==> VT-2402087500',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly applicationCode?: string;

  @ApiProperty({
    type: String,
    description: 'applicationUnifiedCode ==> U-2404254680',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly applicationUnifiedCode?: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'b2bSubscription Id',
  })
  @IsOptional()
  @IsNumberString()
  readonly b2bSubscription!: any;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'b2bSubscriptionRequest Id',
  })
  @IsOptional()
  @IsNumberString()
  readonly b2bSubscriptionRequest!: any;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'b2bClientAccount Id',
  })
  @IsOptional()
  @IsNumberString()
  readonly b2bClientAccount!: any;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'corporateProfile Id',
  })
  @IsOptional()
  @IsNumberString()
  readonly corporateProfile!: any;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Internal Invoice Id',
  })
  @IsOptional()
  @IsNumberString()
  readonly internalInvoice!: any;

  @ApiProperty({
    type: String,
    description: Object.values(ENUM_PAYMENT_METHOD).join('/'),
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly paymentMethod?: string;
}

export class FilterCorporateTransactionDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of results',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly limit: number;

  @ApiProperty({
    type: Number,
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly page: number;

  @ApiProperty({
    type: String,
    description: 'The search term',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly searchTerm!: string;

  @ApiProperty({
    type: Date,
    required: false,
    example: new Date(),
  })
  @IsOptional()
  @IsDateString()
  startDate!: Date;

  @ApiProperty({
    type: Date,
    required: false,
    example: new Date(),
  })
  @IsOptional()
  @IsDateString()
  endDate!: Date;

  @ApiProperty({
    type: String,
    description: 'applicationCode ==> VT-2402087500',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly applicationCode?: string;

  @ApiProperty({
    type: String,
    description: 'applicationUnifiedCode ==> U-2404254680',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly applicationUnifiedCode?: string;
}
