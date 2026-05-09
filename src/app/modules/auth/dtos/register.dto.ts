import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GuestCartItemDTO } from '../../cart/dtos/cart/guest-cart.dto';

export class RegisterDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'superadmin@fibonaccibooks.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Zahid Hassan',
  })
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;

  @ApiProperty({
    type: [GuestCartItemDTO],
    required: false,
    description: 'Guest cart items to merge with user cart after registration'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDTO)
  readonly guestCartItems?: GuestCartItemDTO[];
}
