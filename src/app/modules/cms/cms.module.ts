import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroBannerInternalController } from './controllers/internal/heroBanner.internal.controller';
import { MenuInternalController } from './controllers/internal/menu.internal.controller';
import { PageInternalController } from './controllers/internal/page.internal.controller';
import { ReviewInternalController } from './controllers/internal/review.internal.controller';
import { SectionInternalController } from './controllers/internal/section.internal.controller';
import { HeroBannerWebController } from './controllers/web/heroBanner.web.controller';
import { MenuWebController } from './controllers/web/menu.web.controller';
import { PageWebController } from './controllers/web/page.web.controller';
import { ReviewWebController } from './controllers/web/review.internal.controller';
import { SectionWebController } from './controllers/web/section.web.controller';
import { HeroBanner } from './entities/heroBanner.entity';
import { Menu } from './entities/menu.entity';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/pageSection.entity';
import { Review } from './entities/review.entity';
import { Section } from './entities/section.entity';
import { SectionItem } from './entities/sectionItems.entity';
import { HeroBannerService } from './services/heroBanner.service';
import { MenuService } from './services/menu.service';
import { PageService } from './services/page.service';
import { PageSectionService } from './services/pageSection.service';
import { ReviewService } from './services/review.service';
import { SectionService } from './services/section.service';
import { SectionItemService } from './services/sectionItem.service';
import { SectionSubscriber } from './subscribers/section.subscriber';

const entities = [Menu, Page, Section, SectionItem, PageSection, HeroBanner, Review];
const services = [MenuService, PageService, SectionService, SectionItemService, PageSectionService, HeroBannerService, ReviewService];
const subscribers = [SectionSubscriber];
const internalControllers = [MenuInternalController, PageInternalController, SectionInternalController, HeroBannerInternalController, ReviewInternalController];
const webControllers = [MenuWebController, SectionWebController, PageWebController, HeroBannerWebController, ReviewWebController];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...webControllers, ...internalControllers],
})
export class CMSModule { }
