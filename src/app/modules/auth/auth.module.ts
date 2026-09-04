import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AclModule } from './../acl/acl.module';
import { UserModule } from './../user/user.module';
import { AuthInternalController } from './controllers/internal/auth.internal.controller';
import { AuthWebController } from './controllers/web/auth.web.controller';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

const entities = [];
const services = [AuthService];
const subscribers = [];
const webControllers = [AuthWebController];
const internalControllers = [AuthInternalController];
const modules = [UserModule, AclModule];
const strategies = [LocalStrategy, JwtStrategy];
const guards = [RolesGuard, PermissionsGuard];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers, ...strategies, ...guards],
  exports: [...services, ...subscribers],
  controllers: [
    ...internalControllers,
    ...webControllers,
  ],
})
export class AuthModule { }
