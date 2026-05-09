import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersModule } from '@src/app/helpers/helpers.module';
import { AclModule } from '../acl/acl.module';
import { GalleryModule } from '../gallery/gallery.module';
import { GlobalConfigModule } from '../globalConfig/globalConfig.module';
import { UserInternalController } from './controllers/internal/user.internal.controller';
import { UserAddressInternalController } from './controllers/internal/userAddress.internal.controller';
import { UserMembershipInternalController } from './controllers/internal/userMembership.internal.controller';
import { UserProfileInternalController } from './controllers/internal/userProfile.internal.controller';
import { UserWebController } from './controllers/web/user.web.controller';
import { UserAddressWebController } from './controllers/web/userAddress.web.controller';
import { UserMembershipWebController } from './controllers/web/userMembership.web.controller';
import { UserProfileWebController } from './controllers/web/userProfile.web.controller';
import { UserWishlistWebController } from './controllers/web/userWishlist.web.controller';
import { User } from './entities/user.entity';
import { UserAddress } from './entities/userAddress.entity';
import { UserMembership } from './entities/userMembership.entity';
import { UserProfile } from './entities/userProfile.entity';
import { UserRole } from './entities/userRole.entity';
import { UserWishlist } from './entities/userWishlist.entity';
import { UserService } from './services/user.service';
import { UserAddressService } from './services/userAddress.service';
import { UserMembershipService } from './services/userMembership.service';
import { UserProfileService } from './services/userProfile.service';
import { UserRoleService } from './services/userRole.service';
import { UserWishlistService } from './services/userWishlist.service';
import { UserSubscriber } from './subscribers/user.subscriber';

const entities = [User, UserProfile, UserRole, UserWishlist, UserMembership, UserAddress];
const services = [
  UserService,
  UserProfileService,
  UserRoleService,
  UserWishlistService,
  UserMembershipService,
  UserAddressService
];
const subscribers = [UserSubscriber];
const internalControllers = [UserInternalController, UserProfileInternalController, UserMembershipInternalController, UserAddressInternalController];
const webControllers = [UserWebController, UserMembershipWebController, UserWishlistWebController, UserProfileWebController, UserAddressWebController];
const modules = [HelpersModule, AclModule, GlobalConfigModule, GalleryModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers, TypeOrmModule],
  controllers: [...webControllers, ...internalControllers],
})
export class UserModule { }
