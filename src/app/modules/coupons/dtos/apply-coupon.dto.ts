import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'WINTER20',
  })
  @IsNotEmpty()
  @IsString()
  readonly code!: string;
}
