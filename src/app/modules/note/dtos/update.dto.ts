import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class NoteUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'note text',
  })
  @IsOptional()
  readonly text!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'user uuid',
  })
  @IsOptional()
  readonly userId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'order uuid',
  })
  @IsOptional()
  readonly orderId!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  readonly isActive!: boolean;

  @IsOptional()
  readonly updatedBy?: any;
}
