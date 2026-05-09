import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class UserWishlistUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    description: 'product Id',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'user Id',
  })
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  readonly updatedBy?: any;
}
