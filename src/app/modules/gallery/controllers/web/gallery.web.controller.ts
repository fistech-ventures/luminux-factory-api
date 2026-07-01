import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@src/app/decorators';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { IAuthUser, IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { storageImageOptions } from '@src/shared';
import { Gallery } from '../../entities/gallery.entity';
import { GalleryService } from '../../services/gallery.service';

@ApiTags('Gallery')
@ApiBearerAuth()
@Controller('web/gallery')
export class GalleryWebController {
  constructor(private readonly service: GalleryService) { }

  RELATIONS = {};

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Gallery> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Public()
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('files', {
      storage: storageImageOptions,
      limits: { fileSize: 52428800 /* 50mb */ },
    }),
  )
  async uploadImage(
    @UploadedFile() file: IFileMeta,
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse<Gallery>> {
    return this.service.uploadFile(file, authUser?.id);
  }

  @Post('uploads')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: storageImageOptions,
      limits: { fileSize: 52428800 /* 50mb */ },
    }),
  )
  async uploadImages(
    @UploadedFiles() files: IFileMeta[],
    @AuthUser() authUser: IAuthUser,
  ): Promise<SuccessResponse<Gallery[]>> {
    return this.service.uploadFiles(files, authUser?.id);
  }
}
