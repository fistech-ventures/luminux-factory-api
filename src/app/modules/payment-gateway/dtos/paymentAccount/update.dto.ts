import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PaymentAccountUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: '14895693625655',
    description: 'mobile / bank account no',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '14895693625655',
    description: 'mobile / bank account no',
  })
  @IsOptional()
  readonly accountNo!: any;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Fibonacci Book Shop / Kawsar Ahmed',
    description: 'mobile / bank account holder name',
  })
  @IsOptional()
  @IsString()
  readonly accountHolder!: any;

  @ApiProperty({
    type: String,
    required: false,
    example: 'mobile/bank/business',
    description: 'mobile banking / bank / pathao courier / steadfast',
  })
  @IsOptional()
  readonly accountType!: any;

  @ApiProperty({
    type: Number,
    required: false,
    example: 156910.69,
    description: 'Current balance',
  })
  @IsOptional()
  readonly currentBalance!: number;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
    description: 'Active status',
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'payment gateway uuid',
  })
  @IsOptional()
  readonly gatewayId!: string;

  @IsOptional()
  readonly updatedBy?: any;
}
