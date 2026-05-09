import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GuestCartItemDTO } from '../../cart/dtos/cart/guest-cart.dto';

export class LoginDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'work.sahed15@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly remember: boolean = false;

  @ApiProperty({
    type: Number,
    required: false,
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  readonly rememberDays: number = 7;

  @ApiProperty({
    type: [GuestCartItemDTO],
    required: false,
    description: 'Guest cart items to merge with user cart after login'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDTO)
  readonly guestCartItems?: GuestCartItemDTO[];
}
