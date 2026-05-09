import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class PaymentAccountCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: '14895693625655',
    description: 'mobile / bank account no',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '14895693625655',
    description: 'mobile / bank account no',
  })
  @IsNotEmpty()
  @IsString()
  readonly accountNo!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Fibonacci Book Shop / Kawsar Ahmed',
    description: 'mobile / bank account holder name',
  })
  @IsNotEmpty()
  @IsString()
  readonly accountHolder!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'mobile/bank/business',
    description: 'mobile banking / bank / pathao courier / steadfast',
  })
  @IsNotEmpty()
  @IsString()
  readonly accountType!: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 156910.69,
    description: 'Current balance',
  })
  @IsNotEmpty()
  @IsNumber()
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
    required: true,
    example: 'payment gateway uuid',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  readonly gatewayId!: string;

  @IsOptional()
  readonly createdBy?: any;
}
