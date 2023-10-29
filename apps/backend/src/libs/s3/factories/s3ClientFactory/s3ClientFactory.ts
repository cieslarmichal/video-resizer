import { S3 } from '@aws-sdk/client-s3';

import { type S3Client } from '../../clients/s3Client/s3Client.js';
import { type S3Config } from '../../types/s3Config.js';

export class S3ClientFactory {
  public static create(config: S3Config): S3Client {
    const { region } = config;

    return new S3({ region });
  }
}
