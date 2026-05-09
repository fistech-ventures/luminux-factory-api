import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SSLCommerzPaymentRequestDTO {
  @ApiProperty({ example: 'orderId10' })
  @IsNotEmpty()
  orderId?: string;

  @ApiProperty({ example: 'p_orderId10' })
  @IsNotEmpty()
  parentOrderId?: string;

  @ApiProperty({ example: 150 })
  @IsNotEmpty()
  amount?: number;
}
