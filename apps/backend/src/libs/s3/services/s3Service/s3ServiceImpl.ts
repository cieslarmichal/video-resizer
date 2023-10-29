/* eslint-disable @typescript-eslint/naming-convention */

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { type DownloadObjectPayload, type S3Service, type UploadObjectPayload } from './s3Service.js';
import { type S3Client } from '../../clients/s3Client/s3Client.js';

export class S3ServiceImpl implements S3Service {
  public constructor(private readonly s3Client: S3Client) {}

  public async uploadObject(payload: UploadObjectPayload): Promise<void> {
    const { bucketName, objectKey, data } = payload;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: data,
    });

    await this.s3Client.send(command);
  }

  public async downloadObject(payload: DownloadObjectPayload): Promise<void> {
    const { bucketName, objectKey } = payload;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await this.s3Client.send(command);
  }
}
