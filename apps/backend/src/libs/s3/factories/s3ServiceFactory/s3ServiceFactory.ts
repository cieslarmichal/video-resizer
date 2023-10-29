import { type S3Service } from '../../services/s3Service/s3Service.js';
import { S3ServiceImpl } from '../../services/s3Service/s3ServiceImpl.js';
import { type S3Config } from '../../types/s3Config.js';
import { S3ClientFactory } from '../s3ClientFactory/s3ClientFactory.js';

export class S3ServiceFactory {
  public static create(config: S3Config): S3Service {
    const s3Client = S3ClientFactory.create(config);

    return new S3ServiceImpl(s3Client);
  }
}
