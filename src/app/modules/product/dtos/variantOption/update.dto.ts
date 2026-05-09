import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class VariantOptionUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Format',
  })
  @IsOptional()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    example: 'variant uuid',
  })
  @IsOptional()
  readonly variantId!: string;

  @IsOptional()
  readonly updatedBy?: any;
}