import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BkashPaymentRequestDTO {
  @ApiProperty({ example: 'invoiceCode' })
  @IsNotEmpty()
  invoiceCode?: string;

  // @ApiProperty({ example: 'parentOrder_1' })
  // @IsNotEmpty()
  // parentOrderId?: string;

  @ApiProperty({ example: 150 })
  @IsNotEmpty()
  amount?: number;
}
