import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class ProductQuestionAnswerCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'It is pirated version & printed as a collectible delux production.',
  })
  @IsNotEmpty()
  @IsString()
  readonly statement!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly createdBy?: any;
}