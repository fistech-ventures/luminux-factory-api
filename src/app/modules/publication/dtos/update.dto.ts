import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PublicationUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Chofa',
  })
  @IsOptional()
  @IsString()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/publication-logo.jpg',
  })
  @IsOptional()
  @IsString()
  readonly logo!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '1980-02-18',
  })
  @IsOptional()
  @IsString()
  readonly established!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: { sale: '35% to 45%', purchase: '20% to 22%' },
  })
  @IsOptional()
  readonly instructions!: any;

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
