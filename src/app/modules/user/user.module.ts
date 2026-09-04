import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersModule } from '@src/app/helpers/helpers.module';
import { AclModule } from '../acl/acl.module';
import { GalleryModule } from '../gallery/gallery.module';
import { GlobalConfigModule } from '../globalConfig/globalConfig.module';
import { UserInternalController } from './controllers/internal/user.internal.controller';
import { UserProfileInternalController } from './controllers/internal/userProfile.internal.controller';
import { UserWebController } from './controllers/web/user.web.controller';
import { UserProfileWebController } from './controllers/web/userProfile.web.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/userProfile.entity';
import { UserRole } from './entities/userRole.entity';
import { UserService } from './services/user.service';
import { UserProfileService } from './services/userProfile.service';
import { UserRoleService } from './services/userRole.service';
import { UserSubscriber } from './subscribers/user.subscriber';

const entities = [User, UserProfile, UserRole];
const services = [
  UserService,
  UserProfileService,
  UserRoleService,
];
const subscribers = [UserSubscriber];
const internalControllers = [UserInternalController, UserProfileInternalController];
const webControllers = [UserWebController, UserProfileWebController];
const modules = [HelpersModule, AclModule, GlobalConfigModule, GalleryModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class UserModule { }
