/* eslint-disable @typescript-eslint/naming-convention */

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';

import { type DownloadObjectPayload, type S3Service, type UploadObjectPayload } from './s3Service.js';
import { type S3Client } from '../../clients/s3Client/s3Client.js';
import { S3ServiceError } from '../../errors/s3ServiceError.js';

export class S3ServiceImpl implements S3Service {
  public constructor(private readonly s3Client: S3Client) {}

  public async uploadObject(payload: UploadObjectPayload): Promise<void> {
    const { bucketName, objectKey, data } = payload;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: data,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new S3ServiceError({
        bucket: bucketName,
        objectKey,
      });
    }
  }

  public async downloadObject(payload: DownloadObjectPayload): Promise<void> {
    const { bucketName, objectKey, destinationPath } = payload;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      const result = await this.s3Client.send(command);

      const body = result.Body;

      if (body instanceof Readable) {
        const writeStream = createWriteStream(destinationPath);

        body.pipe(writeStream);
      }
    } catch (error) {
      throw new S3ServiceError({
        bucket: bucketName,
        objectKey,
      });
    }
  }
}
