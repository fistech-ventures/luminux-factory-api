import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { storageImageOptions } from '@src/shared';
import { FileUploadService, IFileResponse } from '../../services/fileUpload.service';

@ApiTags('File Storage')
@ApiBearerAuth()
@Controller('internal/files')
export class InternalFileStorageController {
  constructor(private readonly fileUploadService: FileUploadService) {}

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
    return this.fileUploadService.uploadToSpace({ file });
  }
}
