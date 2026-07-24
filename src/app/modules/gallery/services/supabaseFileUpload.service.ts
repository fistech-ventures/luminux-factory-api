import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { asyncForEach } from '@src/shared';
import axios from 'axios';
import * as fs from 'fs';
import { join } from 'path';
import { SupabaseUploadHelper } from '@src/app/helpers/supabaseUpload.helper';

export interface IFileResponse {
  url: string;
  key?: string;
}

@Injectable()
export class SupabaseFileUploadService {
  constructor(private readonly supabaseHelper: SupabaseUploadHelper) {}

  BASE = join(process.cwd(), 'uploads/images');

  async uploadImage(file: IFileMeta): Promise<IFileResponse> {
    const uploaded = await this.uploadToSupabase({ file });
    return uploaded;
  }

  async uploadImages(files: IFileMeta[]): Promise<SuccessResponse> {
    const uploaded = [];

    await asyncForEach(files, async (file: IFileMeta) => {
      let items = null;

      items = await this.uploadToSupabase({ file });
      if (items) uploaded.push(items);
    });

    return new SuccessResponse('Uploaded successfully', uploaded);
  }

  async uploadToSupabase(data: { file: IFileMeta; folder?: string }): Promise<IFileResponse> {
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
      const originalName = file.originalname ? file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-') : `${Date.now()}.${extension}`;
      const fileName = `${Date.now()}-${originalName}`;
      
      const url = await this.supabaseHelper.uploadBinary(folder, fileStream, fileName, file.mimetype);
      
      if (url) {
        try {
          await fs.unlinkSync(join(process.cwd(), filePath));
        } catch (error) {
          console.error('🚀 ~ SupabaseFileUploadService ~ uploadToSupabase ~ unlinkSync ~ error:', error);
        }
        return { url, key: `${folder}/${fileName}` };
      } else {
        console.error('🚀 ~ SupabaseFileUploadService ~ uploadToSupabase ~ url:', url);
        throw new HttpException('Failed to retrieve URL from Supabase after upload', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error('🚀 ~ SupabaseFileUploadService ~ uploadToSupabase ~ error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Error uploading file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFromSupabase(key: string): Promise<void> {
    try {
      await this.supabaseHelper.deleteFile(key);
    } catch (error) {
      console.error("🚀 ~ SupabaseFileUploadService ~ deleteFromSupabase ~ error:", error)
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

    // Upload to Supabase
    const url = await this.supabaseHelper.uploadBinary(
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
