import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BaseBulkDeleteDTO } from '@src/app/base/baseBulkDelete.dto';
import { AuthUser } from '@src/app/decorators';
import { Public } from '@src/app/decorators/publicRoute.decorator';
import { IAuthUser, IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { storageImageOptions } from '@src/shared';
import { FindOptionsRelations } from 'typeorm';
import { FilterGalleryDTO } from '../../dtos/filter.dto';
import { UpdateGalleryDTO } from '../../dtos/update.dto';
import { Gallery } from '../../entities/gallery.entity';
import { GalleryService } from '../../services/gallery.service';

@ApiTags('Gallery')
@ApiBearerAuth()
@Controller('internal/gallery')
export class InternalGalleryController {
  constructor(private readonly service: GalleryService) {}
  RELATIONS: FindOptionsRelations<Gallery> = {};

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
  ): Promise<SuccessResponse | Gallery> {
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
    FilesInterceptor('files', 5, {
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

  @Get()
  async findAll(@Query() query: FilterGalleryDTO): Promise<SuccessResponse<Gallery[]>> {
    return this.service.findAllBase(query);
  }

  @Get('types')
  async findTypes(): Promise<any> {
    return this.service.findTypes();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Gallery> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() body: UpdateGalleryDTO): Promise<Gallery> {
    return this.service.updateOneBase(id, body);
  }

  @Delete('bulk')
  async deleteBulk(@Body() body: BaseBulkDeleteDTO): Promise<SuccessResponse> {
    return this.service.bulkRemoveGallery(body.ids);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<SuccessResponse> {
    return this.service.removeGallery(id);
  }
}
