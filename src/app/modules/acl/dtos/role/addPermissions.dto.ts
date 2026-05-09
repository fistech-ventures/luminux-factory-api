import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray, IsUUIDArray } from '@src/app/decorators';
import { IsOptional } from 'class-validator';

export class AddPermissionsDTO {
  @ApiProperty({
    type: [String],
    required: true,
    example: ['permission id 1', 'permission id 2'],
  })
  @IsNotEmptyArray()
  @IsUUIDArray()
  permissions!: any[];

  @IsOptional()
  readonly createdBy?: any;
}
