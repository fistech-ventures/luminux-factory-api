import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IExtraPaymentRequestOptions } from '../interfaces';
import { ENUM_PAYMENT_GATEWAY_TYPE } from './../enums/index';

export class PaymentRequestDTO {
  @ApiProperty({
    example: Object.values(ENUM_PAYMENT_GATEWAY_TYPE).join(' / '),
    enum: ENUM_PAYMENT_GATEWAY_TYPE,
  })
  @IsNotEmpty()
  paymentGatewayType?: string;

  @ApiProperty({ example: 'userInvoice uuid ' })
  @IsNotEmpty()
  userInvoiceId?: string;

  // @ApiProperty({ example: 1 })
  // @IsNumber()
  // @IsNotEmpty()
  // applicationId?: number;

  @ApiProperty({ example: 'INV2311292271' })
  @IsOptional()
  @IsString()
  invoiceCode?: string;

  @ApiProperty({ example: 'TXN2311292271' })
  @IsOptional()
  @IsString()
  transactionCode?: string;

  @ApiProperty({ example: 'https://demo.com.bd' })
  @IsNotEmpty()
  originUrl?: string;

  @ApiProperty({ example: 'https://demo.com.bd/orders', description: 'Frontend Callback URL' })
  @IsNotEmpty()
  webCallbackUrl?: string;

  @ApiProperty({ example: 'Red XXL Raymond Shirt' })
  productName?: string;

  @ApiProperty({ example: 'Red XXL Raymond Shirt' })
  productCategory?: string;

  @ApiProperty({ example: 'Red XXL Raymond Shirt' })
  orderDescription?: string;

  @ApiProperty({ example: 150 })
  @IsNotEmpty()
  amount?: number;

  @ApiProperty({ example: 50 })
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({ example: 50 })
  @IsOptional()
  productAmount?: number;

  @ApiProperty({ example: 'Zahid Hasan' })
  customerName?: string;

  @ApiProperty({ example: 'zahidhasan065@gmail.com' })
  customerEmail?: string;

  @ApiProperty({ example: '01636476123' })
  customerPhoneNumber?: string;

  @ApiProperty({
    example: {
      customerAddress1: 'Address 1',
      customerAddress2: 'Address 2',
      customerCity: 'Dhaka',
      customerCountry: 'BD',
    },
  })
  @IsOptional()
  extras?: IExtraPaymentRequestOptions;

  @ApiProperty({ example: 'userId' })
  @IsOptional()
  userId?: string;
}
