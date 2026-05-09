import { ApiProperty } from '@nestjs/swagger';
import { UniqueValidatorPipe } from '@src/app/pipes/uniqueValidator.pipe';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  ValidationArguments,
} from 'class-validator';
import { FindOptionsWhere } from 'typeorm';
import { Permission } from '../../entities/permission.entity';

export class CreatePermissionDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'catalogs.create',
  })
  @IsNotEmpty()
  @IsString()
  @Validate(UniqueValidatorPipe<Permission>, [
    Permission,
    (args: ValidationArguments): FindOptionsWhere<Permission> => {
      const dto = args.object as CreatePermissionDTO;
      return {
        title: dto.title,
      };
    },
  ])
  readonly title!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'permission type id',
  })
  @IsOptional()
  @IsUUID()
  readonly permissionTypeId!: any;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive: boolean = true;

  @IsOptional()
  readonly createdBy?: any;
}

export class PermissionUpsertBulkDTO {
  @ApiProperty({
    type: [String],
    required: true,
    example: ['catalogs.create'],
  })
  @IsNotEmpty()
  @IsArray()
  readonly permissions!: string[];

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive: boolean = true;

  @IsOptional()
  readonly createdBy?: any;
}