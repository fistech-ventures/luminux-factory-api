import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGlobalConfigDTO {
  @ApiProperty({
    type: Number,
    required: false,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  readonly otpExpiresInMin!: number;

  @IsOptional()
  updatedBy?: any;
}

export class UpdateAnalyticsConfigDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'google-site-verification-code',
  })
  @IsOptional()
  @IsString()
  readonly googleSiteVerification!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'bing-site-verification-code',
  })
  @IsOptional()
  @IsString()
  readonly bingSiteVerification!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'googleTagManagerCode',
  })
  @IsOptional()
  @IsString()
  readonly googleTagManagerCode!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'googleAnalyticsId',
  })
  @IsOptional()
  @IsString()
  readonly googleAnalyticsId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'metaPixelId',
  })
  @IsOptional()
  @IsString()
  readonly metaPixelId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'metaAppId',
  })
  @IsOptional()
  @IsString()
  readonly metaAppId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'metaMessengerId',
  })
  @IsOptional()
  @IsString()
  readonly metaMessengerId!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'umamiId',
  })
  @IsOptional()
  @IsString()
  readonly umamiId!: string;

  @IsOptional()
  updatedBy?: any;
}
