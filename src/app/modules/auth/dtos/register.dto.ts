import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'superadmin@fibonaccibooks.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Zahid Hassan',
  })
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
