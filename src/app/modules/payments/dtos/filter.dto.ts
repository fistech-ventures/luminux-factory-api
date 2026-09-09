import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class FilterPaymentDTO extends BaseFilterDTO {
  @ApiProperty({
    type: String,
    required: false,
    enum: ['customer', 'supplier'],
    example: 'customer',
  })
  @IsOptional()
  @IsIn(['customer', 'supplier'])
  entityType?: 'customer' | 'supplier';

  @ApiProperty({ type: String, required: false, example: 'customer or supplier uuid' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ENUM_PAYMENT_METHODS,
    example: ENUM_PAYMENT_METHODS.CASH,
  })
  @IsOptional()
  @IsEnum(ENUM_PAYMENT_METHODS)
  paymentMethod?: ENUM_PAYMENT_METHODS;
}