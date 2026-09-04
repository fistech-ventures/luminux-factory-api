import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { storageImageOptions } from '@src/shared';
import { R2FileUploadService, IFileResponse } from '../../services/r2FileUpload.service';
import { Public } from '@src/app/decorators/publicRoute.decorator';

@ApiTags('File Storage')
@ApiBearerAuth()
@Controller('web/files')
export class FileStorageWebController {
  constructor(private readonly fileUploadService: R2FileUploadService) { }

  @Public()
  @Post()
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
    FilesInterceptor('files', 5, {
      storage: storageImageOptions,
      limits: { fileSize: 52428800 /* 50mb */ },
    }),
  )
  async uploadImage(@UploadedFiles() files: IFileMeta[]): Promise<SuccessResponse> {
    return this.fileUploadService.uploadImages(files);
  }

  @Post('video')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageImageOptions,
      limits: { fileSize: 52428800 /* 50mb */ },
    }),
  )
  async uploadVideo(@UploadedFile() file: IFileMeta): Promise<IFileResponse> {
    return this.fileUploadService.uploadToR2({ file });
  }
}
