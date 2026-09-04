import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { asyncForEach } from '@src/shared';
import axios from 'axios';
import * as fs from 'fs';
import { join } from 'path';
import { R2UploadHelper } from '@src/app/helpers';

export interface IFileResponse {
  url: string;
  key?: string;
}

@Injectable()
export class R2FileUploadService {
  constructor(private readonly r2Helper: R2UploadHelper) {}

  BASE = join(process.cwd(), 'uploads/images');

  async uploadImage(file: IFileMeta): Promise<IFileResponse> {
    const uploaded = await this.uploadToR2({ file });
    return uploaded;
  }

  async uploadImages(files: IFileMeta[]): Promise<SuccessResponse> {
    const uploaded = [];

    await asyncForEach(files, async (file: IFileMeta) => {
      let items = null;

      items = await this.uploadToR2({ file });
      if (items) uploaded.push(items);
    });

    return new SuccessResponse('Uploaded successfully', uploaded);
  }

  async uploadToR2(data: { file: IFileMeta; folder?: string }): Promise<IFileResponse> {
    try {
      const { file } = data;
      if (!file) return null;

      const filePath = file.path;
      if (!filePath) return null;

      const extension = filePath.split('.').pop();

      let folder = data?.folder;
      if (!folder) {
        folder = this.getFolderByMimeType(file);
      }

      const fileStream = await fs.createReadStream(filePath);
      let fileName = `${Date.now()}.${extension}`;
      if (file.originalname) {
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-');
        const lastDotIndex = sanitizedName.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          const nameWithoutExt = sanitizedName.substring(0, lastDotIndex);
          const ext = sanitizedName.substring(lastDotIndex);
          fileName = `${nameWithoutExt}-${Date.now()}${ext}`;
        } else {
          fileName = `${sanitizedName}-${Date.now()}.${extension}`;
        }
      }

      const url = await this.r2Helper.uploadBinary(folder, fileStream, fileName, file.mimetype);

      if (url) {
        try {
          await fs.unlinkSync(join(process.cwd(), filePath));
        } catch (error) {
          console.error('🚀 ~ R2FileUploadService ~ uploadToR2 ~ unlinkSync ~ error:', error);
        }
        return { url, key: `${folder}/${fileName}` };
      } else {
        console.error('🚀 ~ R2FileUploadService ~ uploadToR2 ~ url:', url);
        throw new HttpException('Failed to retrieve URL from R2 after upload', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error('🚀 ~ R2FileUploadService ~ uploadToR2 ~ error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Error uploading file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFromR2(key: string): Promise<void> {
    try {
      await this.r2Helper.deleteFile(key);
    } catch (error) {
      console.error("🚀 ~ R2FileUploadService ~ deleteFromR2 ~ error:", error)
    }
  }

  async uploadFacebookProfilePic(imageUrl: string): Promise<string> {
    // Fetch image as stream
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    // Create unique filename
    const filename = `${Date.now()}.jpg`;

    // Upload to R2
    const url = await this.r2Helper.uploadBinary(
      'profiles',
      response.data,
      filename,
      'image/jpeg'
    );

    return url;
  }

  getFolderByMimeType(file: IFileMeta): string {
    if (file?.mimetype) return file?.mimetype?.split('/')[0] + 's';
    return 'assets';
  }
}