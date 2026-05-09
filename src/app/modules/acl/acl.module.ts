import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalPermissionController } from './controllers/internal/permission.internal.controller';
import { InternalPermissionTypeController } from './controllers/internal/permissionType.internal.controller';
import { InternalRoleController } from './controllers/internal/role.internal.controller';
import { Permission } from './entities/permission.entity';
import { PermissionType } from './entities/permissionType.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/rolePermission.entity';
import { PermissionService } from './services/permission.service';
import { PermissionTypeService } from './services/permissionType.service';
import { RoleService } from './services/role.service';
import { RolePermissionService } from './services/rolePermission.service';

const entities = [Role, Permission, PermissionType, RolePermission];
const services = [RoleService, PermissionService, PermissionTypeService, RolePermissionService];
const subscribers = [];
const controllers = [];
const internalControllers = [
  InternalRoleController,
  InternalPermissionController,
  InternalPermissionTypeController,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...internalControllers],
})
export class AclModule {}
