import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class UserWishlistCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    description: 'product Id',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsOptional()
  createdBy?: any;
}
