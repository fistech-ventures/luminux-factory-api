import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '@src/env';
import { mimeTypeMapping } from '@src/shared/constants/mimeTypes.constants';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';

@Injectable()
export class SupabaseUploadHelper {
  constructor(private readonly http: HttpService) {
    this.supabase = createClient(
      ENV.supabase.url,
      ENV.supabase.serviceKey,
      {
        auth: {
          persistSession: false
        }
      }
    );
  }

  private supabase: SupabaseClient;

  public async uploadBinary(
    folder = 'media',
    binary: Buffer | Readable,
    fileName?: string,
    contentType?: string,
  ): Promise<string> {
    try {
      const key = fileName || `${Date.now()}`;
      const filePath = `${folder}/${key}`;
      const bucketName = ENV.supabase.bucket?.trim();

      if (!bucketName) {
        throw new HttpException('Supabase bucket name is not configured in the environment variables', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const { error } = await this.supabase.storage
        .from(bucketName)
        .upload(filePath, binary, {
          contentType: contentType || 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('🚀 ~ SupabaseUploadHelper ~ upload error:', error);
        throw new HttpException(`Supabase upload error: ${error.message || 'Unknown error'}`, HttpStatus.BAD_REQUEST);
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('🚀 ~ SupabaseUploadHelper ~ error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Error uploading to Supabase', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async downloadAndUploadToSupabase(payload: {
    fileUrl: string;
    accessToken?: string;
    fileName?: string;
  }): Promise<string> {
    try {
      const mediaResponse = await this.http.get(payload.fileUrl, {
        headers: {
          Authorization: `Bearer ${payload.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      const mediaData = await firstValueFrom(mediaResponse);

      const contentType = mediaData.headers['content-type'];

      const extension = mimeTypeMapping[contentType] || 'jpg';

      const fileName = `${payload.fileName}.${extension}` || `${Date.now()}.${extension}`;

      const binary = mediaData.data;

      return this.uploadBinary('media-manager', binary, fileName, contentType);
    } catch (error) {
      console.error('🚀 ~ SupabaseUploadHelper ~ downloadAndUploadToSupabase ~ error:', error);
      return '';
    }
  }

  public async downloadAndUploadToSupabaseV2(payload: {
    fileUrl: string;
    accessToken?: string;
    fileName?: string;
  }): Promise<{ url: string; mimeType: string }> {
    try {
      const mediaResponse = await this.http.get(payload.fileUrl, {
        headers: {
          Authorization: `Bearer ${payload.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      const mediaData = await firstValueFrom(mediaResponse);

      const contentType = mediaData.headers['content-type'];

      const extension = mimeTypeMapping[contentType] || 'jpg';

      const fileName = `${payload.fileName}` || `${Date.now()}.${extension}`;

      const binary = mediaData.data;

      const url = await this.uploadBinary('media-manager', binary, fileName, contentType);
      return {
        url,
        mimeType: contentType,
      };
    } catch (error) {
      console.error('🚀 ~ SupabaseUploadHelper ~ downloadAndUploadToSupabaseV2 ~ error:', error);
      return { url: '', mimeType: '' };
    }
  }

  public async downloadAndUploadToSupabaseTelegram(payload: {
    fileUrl: string;
    accessToken?: string;
    fileName?: string;
  }): Promise<{ url: string; mimeType: string }> {
    try {
      const mediaResponse = await this.http.get(payload.fileUrl, {
        headers: {
          Authorization: `Bearer ${payload.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      const mediaData = await firstValueFrom(mediaResponse);

      const contentType = mediaData.headers['content-type'];

      const extension = mimeTypeMapping[contentType] || 'jpg';

      const fileName = `${payload.fileName}` || `${Date.now()}.${extension}`;

      const binary = mediaData.data;

      const url = await this.uploadBinary('media-manager', binary, fileName, contentType);
      return {
        url,
        mimeType: contentType,
      };
    } catch (error) {
      console.error('🚀 ~ SupabaseUploadHelper ~ downloadAndUploadToSupabaseTelegram ~ error:', error);
      return { url: '', mimeType: '' };
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      const bucketName = ENV.supabase.bucket?.trim();
      if (!bucketName) return;

      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('🚀 ~ SupabaseUploadHelper ~ deleteFile ~ error:', error);
      }
    } catch (error) {
      console.error('🚀 ~ SupabaseUploadHelper ~ deleteFile ~ error:', error);
    }
  }
}
