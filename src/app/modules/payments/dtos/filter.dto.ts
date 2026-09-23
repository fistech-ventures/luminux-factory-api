import { ApiProperty } from '@nestjs/swagger';
import { BaseFilterDTO } from '@src/app/base/baseFilter.dto';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class FilterPaymentDTO extends BaseFilterDTO {
  @ApiProperty({
    type: String,
    required: false,
    enum: ['customer', 'supplier', 'employee'],
    example: 'customer',
  })
  @IsOptional()
  @IsIn(['customer', 'supplier', 'employee'])
  entityType?: 'customer' | 'supplier' | 'employee';

  @ApiProperty({ type: String, required: false, example: 'customer / supplier / employee uuid' })
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