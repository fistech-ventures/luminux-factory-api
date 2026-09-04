// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import { HttpService } from '@nestjs/axios';
// import { Injectable } from '@nestjs/common';
// import { ENV } from '@src/env';
// import { mimeTypeMapping } from '@src/shared/constants/mimeTypes.constants';
// import { firstValueFrom } from 'rxjs';
// import { Readable } from 'stream';

// @Injectable()
// export class FileUploadHelper {
//   constructor(private readonly http: HttpService) {
//     this.s3 = new S3Client({
//       region: 'auto',
//       endpoint: `https://${ENV.s3.endpoint}`,
//       credentials: {
//         accessKeyId: ENV.s3.accessKey,
//         secretAccessKey: ENV.s3.secretKey,
//       },
//     });
//   }
//   private s3: S3Client;

//   public async uploadBinary(
//     folder = 'media',
//     binary: Buffer | Readable,
//     fileName?: string,
//     contentType?: string,
//   ): Promise<string> {
//     try {
//       const key = fileName || `${Date.now()}`;
//       const command = new PutObjectCommand({
//         Bucket: ENV.s3.bucket,
//         Key: `${ENV.s3.folderPrefix}/${folder}/${key}`,
//         Body: binary,
//         ContentType: contentType || 'image/jpeg',
//         ACL: 'public-read',
//       });

//       await this.s3.send(command);

//       const endpoint = ENV.s3.endpoint?.replace(/\/$/, ''); // Remove trailing slash if any
//       const url = `https://${endpoint}/${ENV.s3.bucket}/${ENV.s3.folderPrefix}/${folder}/${key}`;
//       return url;
//     } catch (error) {
//       console.error('🚀 ~ FileUploadHelper ~ error:', error);
//       return '';
//     }
//   }

//   public async downloadAndUploadToSpace(payload: {
//     fileUrl: string;
//     accessToken?: string;
//     fileName?: string;
//   }): Promise<string> {
//     try {
//       const mediaResponse = await this.http.get(payload.fileUrl, {
//         headers: {
//           Authorization: `Bearer ${payload.accessToken}`,
//         },
//         responseType: 'arraybuffer',
//       });

//       const mediaData = await firstValueFrom(mediaResponse);

//       const contentType = mediaData.headers['content-type'];

//       const extension = mimeTypeMapping[contentType] || 'jpg';

//       const s3Key = `${payload.fileName}.${extension}` || `${Date.now()}.${extension}`;

//       const binary = mediaData.data;

//       return this.uploadBinary('media-manager', binary, s3Key, contentType);
//     } catch (error) {
//       console.error('🚀 ~ file: fileUpload.helper.ts:39 ~ FileUploadHelper ~ error:', error);
//       return '';
//     }
//   }

//   public async downloadAndUploadToSpaceV2(payload: {
//     fileUrl: string;
//     accessToken?: string;
//     fileName?: string;
//   }): Promise<{ url: string; mimeType: string }> {
//     try {
//       const mediaResponse = await this.http.get(payload.fileUrl, {
//         headers: {
//           Authorization: `Bearer ${payload.accessToken}`,
//         },
//         responseType: 'arraybuffer',
//       });

//       const mediaData = await firstValueFrom(mediaResponse);

//       const contentType = mediaData.headers['content-type'];

//       const extension = mimeTypeMapping[contentType] || 'jpg';

//       const s3Key = `${payload.fileName}` || `${Date.now()}.${extension}`;

//       const binary = mediaData.data;

//       const url = await this.uploadBinary('media-manager', binary, s3Key, contentType);
//       return {
//         url,
//         mimeType: contentType,
//       };
//     } catch (error) {
//       console.error('🚀 ~ file: fileUpload.helper.ts:39 ~ FileUploadHelper ~ error:', error);
//       return { url: '', mimeType: '' };
//     }
//   }

//   public async downloadAndUploadToSpaceTelegram(payload: {
//     fileUrl: string;
//     accessToken?: string;
//     fileName?: string;
//   }): Promise<{ url: string; mimeType: string }> {
//     try {
//       const mediaResponse = await this.http.get(payload.fileUrl, {
//         headers: {
//           Authorization: `Bearer ${payload.accessToken}`,
//         },
//         responseType: 'arraybuffer',
//       });

//       const mediaData = await firstValueFrom(mediaResponse);

//       const contentType = mediaData.headers['content-type'];

//       const extension = mimeTypeMapping[contentType] || 'jpg';

//       const s3Key = `${payload.fileName}` || `${Date.now()}.${extension}`;

//       const binary = mediaData.data;

//       const url = await this.uploadBinary('media-manager', binary, s3Key, contentType);
//       return {
//         url,
//         mimeType: contentType,
//       };
//     } catch (error) {
//       console.error('🚀 ~ file: fileUpload.helper.ts:39 ~ FileUploadHelper ~ error:', error);
//       return { url: '', mimeType: '' };
//     }
//   }
// }
