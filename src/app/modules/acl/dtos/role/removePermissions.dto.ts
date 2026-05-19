import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyArray, IsUUIDArray } from '@src/app/decorators';
import { IsOptional } from 'class-validator';

export class RemovePermissionsDTO {
  @ApiProperty({
    type: [String],
    required: true,
    example: ['permission id 1', 'permission id 2'],
  })
  @IsNotEmptyArray()
  @IsUUIDArray()
  permissions!: any[];

  @IsOptional()
  readonly updatedBy?: any;

  @IsOptional()
  readonly deletedBy?: any;
}
