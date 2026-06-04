import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthRequestDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'http://localhost:4200',
  })
  @IsNotEmpty()
  @IsString()
  readonly webRedirectUrl!: string;

  @ApiProperty({
    type: [Object],
    required: false,
    description: 'Guest cart items to merge after login',
  })
  @IsOptional()
  readonly guestCartItems?: any[];

  @ApiProperty({
    type: [Object],
    required: false,
    description: 'Guest wishlist items to merge after login',
  })
  @IsOptional()
  readonly guestWishlistItems?: any[];
}
