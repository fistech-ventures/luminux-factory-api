import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SourceShopCreateDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Book Harbour',
  })
  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Rafi',
  })
  @IsOptional()
  @IsString()
  readonly contactPerson!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '8801212125224',
  })
  @IsOptional()
  @IsString()
  readonly phoneNumber!: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: { addressLine: "L2/101, Ashik Tower, Chawbazar", area: "Dhaka", deliveryZone: "INSIDE_DHAKA / NEARBY_DHAKA / OUTSIDE_DHAKA" },
  })
  @IsOptional()
  @IsString()
  readonly address!: any;

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
