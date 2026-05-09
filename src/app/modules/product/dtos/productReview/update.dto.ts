import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ENUM_PRODUCT_REVIEW_STATUS } from '../../const';

export class ProductReviewStatusUpdateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_PRODUCT_REVIEW_STATUS.PENDING),
  })
  @IsNotEmpty()
  @IsString()
  readonly status!: string;

  @IsOptional()
  readonly updatedBy?: any;
}