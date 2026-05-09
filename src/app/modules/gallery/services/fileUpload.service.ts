import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { IFileMeta } from '@src/app/interfaces';
import { SuccessResponse } from '@src/app/types';
import { ENV } from '@src/env';
import { asyncForEach } from '@src/shared';
import axios from 'axios';
import * as fs from 'fs';
import { join } from 'path';

export interface IFileResponse {
  url: string;
  key?: string;
}

@Injectable()
export class FileUploadService {
  constructor() {
    this.s3 = new S3Client({
      region: 'auto', // DigitalOcean Spaces doesn't require region
      endpoint: `https://${ENV.s3.endpoint}`, // DigitalOcean Spaces endpoint
      credentials: {
        accessKeyId: ENV.s3.accessKey,
        secretAccessKey: ENV.s3.secretKey,
      },
    });
  }

  private s3: S3Client;
  BASE = join(process.cwd(), 'uploads/images');

  async uploadImage(file: IFileMeta): Promise<IFileResponse> {
    const uploaded = await this.uploadToSpace({ file });
    return uploaded;
  }

  async uploadImages(files: IFileMeta[]): Promise<SuccessResponse> {
    const uploaded = [];

    await asyncForEach(files, async (file: IFileMeta) => {
      let items = null;

      items = await this.uploadToSpace({ file });
      if (items) uploaded.push(items);
    });

    return new SuccessResponse('Uploaded successfully', uploaded);
  }

  async uploadToSpace(data: { file: IFileMeta; folder?: string }): Promise<IFileResponse> {
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
      const fileKey = `${ENV.s3.folderPrefix ? `${ENV.s3.folderPrefix}/` : ''}${ENV.env}/${folder}/${Date.now()}.${extension}`;
      const command = new PutObjectCommand({
        Bucket: `${ENV.s3.bucket}`,
        Key: fileKey,
        Body: fileStream,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      const send = await this.s3.send(command);
      if (send) {
        const fileUrl = `https://${ENV.s3.endpoint}/${ENV.s3.bucket}/${fileKey}`;
        try {
          await fs.unlinkSync(join(process.cwd(), filePath));
        } catch (error) {
          console.error('🚀 ~ FileUploadService ~ uploadToSpace ~ unlinkSync ~ error:', error);
        }
        return { url: fileUrl, key: fileKey };
      } else {
        console.error('🚀 ~ FileUploadService ~ uploadToSpace ~ send:', send);
        return null;
      }
    } catch (error) {
      console.error('🚀 ~ FileUploadService ~ uploadToSpace ~ error:', error);
      return null;
    }
  }

  async deleteFromSpace(key: string): Promise<void> {
    try {
      const params = {
        Bucket: ENV.s3.bucket,
        Key: key,
      };
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
    } catch (error) {
      console.error("🚀 ~ FileUploadService ~ deleteFromSpace ~ error:", error)
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
    const filename = `profiles/${Date.now()}.jpg`;

    // Upload to your Space
    await this.s3.send(
      new PutObjectCommand({
        Bucket: ENV.s3.bucket,
        Key: filename,
        Body: response.data,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
      }),
    );
    return `https://${ENV.s3.endpoint}/${ENV.s3.bucket}/${filename}`;
  }

  getFolderByMimeType(file: IFileMeta): string {
    if (file?.mimetype) return file?.mimetype?.split('/')[0] + 's';
    return 'assets';
  }
}
