import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENUM_TABLE_NAMES, asyncForEach } from '@src/shared';
import { DataSource, In, Repository } from 'typeorm';
import { CreateGalleryDTO } from '../dtos/create.dto';
import { Gallery } from '../entities/gallery.entity';
import { R2FileUploadService } from './r2FileUpload.service';

@Injectable()
export class GalleryService extends BaseService<Gallery> {
  constructor(
    @InjectRepository(Gallery)
    public readonly _repo: Repository<Gallery>,
    private readonly dataSource: DataSource,
    private readonly fileUploadService: R2FileUploadService,
  ) {
    super(_repo);
  }

  async findTypes(): Promise<any[]> {
    try {
      const query = `
        SELECT "mimetype", COUNT(id) AS "count"
        FROM ${ENUM_TABLE_NAMES.GALLERY}
        GROUP BY "mimetype"
      `;
      const types = await this.dataSource.query(query);
      return types;
    } catch {
      throw new NotFoundException('Types counts not found');
    }
  }

  async uploadFile(file: IFileMeta, createdBy?: string): Promise<SuccessResponse<Gallery>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let createdGallery = null;

    try {
      const fileData = await this.fileUploadService.uploadToR2({ file });
      if (!fileData) {
        throw new Error('File not uploaded');
      }
      const extension = file.path.split('.').pop();

      const galleryData: CreateGalleryDTO = {
        title: file?.originalname?.replace(`.${extension}`, ''),
        url: fileData?.url,
        key: fileData?.key,
        mimetype: file?.mimetype,
        extension: extension,
        createdBy: createdBy || null,
      };
      createdGallery = await queryRunner.manager.save(Object.assign(new Gallery(), galleryData));

      if (!createdGallery) {
        throw new Error('Gallery not created');
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return createdGallery;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  async uploadFiles(files: IFileMeta[], createdBy?: string): Promise<SuccessResponse<Gallery[]>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdGalleryData = [];

    try {
      const filesData = await this.fileUploadService.uploadImages(files);

      if (!filesData?.success) {
        throw new Error('Files not uploaded');
      }
      await asyncForEach(filesData?.data as any, async (fileData, i) => {
        const extension = files[i].path.split('.').pop();

        const galleryData: CreateGalleryDTO = {
          title: files[i]?.originalname?.replace(`.${extension}`, ''),
          url: fileData?.url,
          key: fileData?.key,
          mimetype: files[i]?.mimetype,
          extension: extension,
          createdBy: createdBy || null,
        };
        const createdGallery = await queryRunner.manager.save(
          Object.assign(new Gallery(), galleryData),
        );

        createdGalleryData.push(createdGallery);
      });

      if (!createdGalleryData?.length) {
        throw new Error('Gallery not created');
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    if (createdGalleryData) {
      return createdGalleryData as any;
    }
  }

  async removeGallery(id: string): Promise<SuccessResponse> {
    const deletedItem = await this.findByIdBase(id);
    try {
      await this.fileUploadService.deleteFromR2(deletedItem?.key);
      // Soft-delete the gallery instead of hard-deleting it.
      // Gallery is a data table, so it is never hard-deleted.
      return this.softDeleteOneBase(id);
    } catch (error) {
      throw error;
    }
  }

  async bulkRemoveGallery(ids: string[]): Promise<SuccessResponse> {
    try {
      const itemsToDelete = await this.find({ where: { id: In(ids) } });
      await asyncForEach(itemsToDelete, async (item) => {
        await this.fileUploadService.deleteFromR2(item?.key);
      });
      // Soft-delete the galleries instead of hard-deleting them.
      // Gallery is a data table, so it is never hard-deleted.
      return this.deleteBulkBase(ids);
    } catch (error) {
      throw error;
    }
  }
}
