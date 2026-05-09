import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ENUM_SERVICE_PROVIDER_TYPE, ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER } from '../const';

export class ServiceProviderCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'SteadFast',
  })
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_SERVICE_PROVIDER_TYPE).join(' / '),
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ENUM_SERVICE_PROVIDER_TYPE)
  readonly type!: string;

  @ApiProperty({
    type: String,
    required: true,
    example: Object.values(ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER).join(' / '),
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER)
  readonly uniqueIdentifier!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'fibonaccibooks.com/service-provider-image.jpg',
  })
  @IsOptional()
  @IsString()
  readonly image!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: {
      endpoint: 'abc',
      method: 'abc',
      authType: 'basic / bearer / ...rest',
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
  @IsBoolean()
  readonly isActive!: boolean;

  @IsOptional()
  readonly createdBy?: any;
}
