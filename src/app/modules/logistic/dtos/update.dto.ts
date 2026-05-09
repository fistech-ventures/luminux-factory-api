import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ENUM_SERVICE_PROVIDER_TYPE } from '../const';

export class ServiceProviderUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Sundarban',
  })
  @IsOptional()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: Object.values(ENUM_SERVICE_PROVIDER_TYPE).join(' / '),
  })
  @IsOptional()
  @IsString()
  @IsEnum(ENUM_SERVICE_PROVIDER_TYPE)
  readonly type!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/service-provider-image.jpg',
  })
  @IsOptional()
  readonly image!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: {
      endpoint: 'abc',
      method: 'abc',
      key: 'abc',
      user: '123',
      password: '123',
      body: {},
      query: "id='123'&key='wewfgrj'",
    },
  })
  @IsOptional()
  @IsObject()
  readonly apiConfig!: any;

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
