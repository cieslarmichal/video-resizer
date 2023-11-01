/* eslint-disable @typescript-eslint/naming-convention */

import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { type Readable } from 'node:stream';

import {
  type GetObjectPayload,
  type S3Service,
  type PutObjectPayload,
  type CheckIfObjectExistsPayload,
} from './s3Service.js';
import { type S3Client } from '../../clients/s3Client/s3Client.js';
import { S3ServiceError } from '../../errors/s3ServiceError.js';

export class S3ServiceImpl implements S3Service {
  public constructor(private readonly s3Client: S3Client) {}

  public async putObject(payload: PutObjectPayload): Promise<void> {
    const { bucket, objectKey, data } = payload;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: data,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new S3ServiceError({
        bucket,
        objectKey,
      });
    }
  }

  public async getObject(payload: GetObjectPayload): Promise<Readable | undefined> {
    const { bucket, objectKey } = payload;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    });

    try {
      const result = await this.s3Client.send(command);

      return result.Body as Readable | undefined;
    } catch (error) {
      throw new S3ServiceError({
        bucket,
        objectKey,
      });
    }
  }

  public async checkIfObjectExists(payload: CheckIfObjectExistsPayload): Promise<boolean> {
    const { bucket, objectKey } = payload;

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    });

    try {
      await this.s3Client.send(command);

      return true;
    } catch (error) {
      return false;
    }
  }
}
