import { ApiProperty } from '@nestjs/swagger';
import { ArrayObjectCanNotBeSame } from '@src/app/decorators';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ENUM_TRANSACTION_STATUS } from '../../enums';

class TransactionsForApproveDTO {
  @ApiProperty({
    type: Number,
    required: true,
    example: '1',
    description: '1',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly id!: any;

  @ApiProperty({
    type: String,
    required: true,
    enum: ENUM_TRANSACTION_STATUS,
    example: ENUM_TRANSACTION_STATUS.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(ENUM_TRANSACTION_STATUS)
  readonly status!: string;

  @ApiProperty({
    type: Boolean,
    required: true,
    example: 'test transaction',
    description: 'notes',
  })
  @ValidateIf(
    (o) =>
      o.status === ENUM_TRANSACTION_STATUS.REJECTED || o.status === ENUM_TRANSACTION_STATUS.HOLD,
  )
  @IsNotEmpty()
  @IsString()
  readonly note?: any;
}

export class ApproveTransactionDTO {
  @ApiProperty({
    type: [TransactionsForApproveDTO],
    required: true,
  })
  @ValidateNested()
  @Type(() => TransactionsForApproveDTO)
  @IsOptional()
  @ArrayObjectCanNotBeSame<TransactionsForApproveDTO>('id')
  readonly transactions!: TransactionsForApproveDTO[];
}
