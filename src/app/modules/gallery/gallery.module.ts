import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersModule } from '@src/app/helpers/helpers.module';
import { InternalFileStorageController } from './controllers/internal/fileUpload.internal.controller';
import { InternalGalleryController } from './controllers/internal/gallery.internal.controller';
import { FileStorageWebController } from './controllers/web/fileUpload.web.controller';
import { GalleryWebController } from './controllers/web/gallery.web.controller';
import { Gallery } from './entities/gallery.entity';
import { FileUploadService } from './services/fileUpload.service';
import { R2FileUploadService } from './services/r2FileUpload.service';
import { GalleryService } from './services/gallery.service';

const entities = [Gallery];
const services = [FileUploadService, R2FileUploadService, GalleryService];
const subscribers = [];

const webControllers = [FileStorageWebController, GalleryWebController];
const internalControllers = [InternalFileStorageController, InternalGalleryController];

const modules = [HelpersModule, HttpModule];

@Module({
  imports: [...modules, TypeOrmModule.forFeature([...entities])],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [
    ...webControllers,
    ...internalControllers,
  ],
})
export class GalleryModule { }
