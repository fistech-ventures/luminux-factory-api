import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ENUM_SCOPE_TYPE } from '../../const';

export class CreateOfferScopeDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'CATEGORY',
    enum: Object.values(ENUM_SCOPE_TYPE),
  })
  @IsEnum(ENUM_SCOPE_TYPE)
  @IsString()
  readonly scopeType!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  @IsUUID()
  readonly categoryId?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  @IsUUID()
  readonly productId?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '7efe629c-3e94-4fa7-a26d-7c5216e41d93',
  })
  @IsOptional()
  @IsUUID()
  readonly productVariantId?: string;

  @IsOptional()
  readonly createdBy?: any;
}
