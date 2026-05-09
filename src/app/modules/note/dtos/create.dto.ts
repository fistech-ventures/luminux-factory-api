import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NoteCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'This is a note text.',
  })
  @IsNotEmpty()
  @IsString()
  readonly text!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'user uuid',
  })
  @IsNotEmpty()
  @IsString()
  readonly userId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'order uuid',
  })
  @IsOptional()
  @IsString()
  readonly orderId!: string;

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
