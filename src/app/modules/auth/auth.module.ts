import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryModule } from '../gallery/gallery.module';
import { CartModule } from './../cart/cart.module';
import { AclModule } from './../acl/acl.module';
import { UserModule } from './../user/user.module';
import { AuthInternalController } from './controllers/internal/auth.internal.controller';
import { AuthWebController } from './controllers/web/auth.web.controller';
import { FacebookOAuthGuard } from './guards/facebook.guard';
import { GoogleOAuthGuard } from './guards/google.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './services/auth.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

const entities = [];
const services = [AuthService];
const subscribers = [];
const webControllers = [AuthWebController];
const internalControllers = [AuthInternalController];
const modules = [UserModule, AclModule, HttpModule, GalleryModule, forwardRef(() => CartModule)];
const strategies = [LocalStrategy, JwtStrategy, GoogleStrategy, FacebookStrategy];
const guards = [RolesGuard, PermissionsGuard, GoogleOAuthGuard, FacebookOAuthGuard];

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
