import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { mimeTypeMapping } from '@src/shared/constants/mimeTypes.constants';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { ENV } from '@src/env';

@Injectable()
export class R2UploadHelper {
  constructor(private readonly http: HttpService) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${ENV.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.r2.accessKeyId || '',
        secretAccessKey: ENV.r2.secretAccessKey || '',
      },
    });
  }

  private s3Client: S3Client;

  public async uploadBinary(
    folder = 'media',
    binary: Buffer | Readable,
    fileName?: string,
    contentType?: string,
  ): Promise<string> {
    const key = fileName || `${Date.now()}`;
    const filePath = `${folder}/${key}`;

    const command = new PutObjectCommand({
      Bucket: ENV.r2.bucketName,
      Key: filePath,
      Body: binary,
      ContentType: contentType || 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await this.s3Client.send(command);

    const publicDomain = ENV.r2.publicDomain || 'https://assets.dailydestinybd.com';
    return `${publicDomain}/${filePath}`;
  }

  public async downloadAndUploadToR2(payload: {
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
      const contentType = mediaData.headers['content-type'] as string;
      const extension = mimeTypeMapping[contentType] || 'jpg';
      const fileName = `${payload.fileName}.${extension}` || `${Date.now()}.${extension}`;
      const binary = mediaData.data;

      return this.uploadBinary('media-manager', binary, fileName, contentType);
    } catch (error) {
      console.error('🚀 ~ R2UploadHelper ~ downloadAndUploadToR2 ~ error:', error);
      return '';
    }
  }

  public async downloadAndUploadToR2V2(payload: {
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
      const contentType = mediaData.headers['content-type'] as string;
      const extension = mimeTypeMapping[contentType] || 'jpg';
      const fileName = `${payload.fileName}.${extension}` || `${Date.now()}.${extension}`;
      const binary = mediaData.data;

      return this.uploadBinary('media-manager-v2', binary, fileName, contentType);
    } catch (error) {
      console.error('🚀 ~ R2UploadHelper ~ downloadAndUploadToR2V2 ~ error:', error);
      return '';
    }
  }

  public async downloadAndUploadToR2Telegram(payload: {
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
      const contentType = mediaData.headers['content-type'] as string;
      const extension = mimeTypeMapping[contentType] || 'jpg';
      const fileName = `${payload.fileName}.${extension}` || `${Date.now()}.${extension}`;
      const binary = mediaData.data;

      return this.uploadBinary('telegram', binary, fileName, contentType);
    } catch (error) {
      console.error('🚀 ~ R2UploadHelper ~ downloadAndUploadToR2Telegram ~ error:', error);
      return '';
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      let key = filePath;
      const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://media.dailydestinybd.com';
      if (filePath.startsWith(publicDomain)) {
        key = filePath.replace(`${publicDomain}/`, '');
      } else if (filePath.startsWith('http')) {
        const url = new URL(filePath);
        key = url.pathname.substring(1);
      }

      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'dailydestinyweb',
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('🚀 ~ R2UploadHelper ~ deleteFile ~ error:', error);
    }
  }
}
