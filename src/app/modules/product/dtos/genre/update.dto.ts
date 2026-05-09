import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GenreUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Thriller',
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

  @IsOptional()
  readonly updatedBy?: any;
}