import { BaseFilterDTO } from '@src/app/base';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ENUM_PAYMENT_METHODS } from '@src/shared';

export class ExpenseFilterDTO extends BaseFilterDTO {
  @ApiProperty({ type: String, required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  spentBy?: string;

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
