import { createReadStream, createWriteStream, existsSync } from 'node:fs';

import { type DownloadFilePayload, type UploadFilePayload, type FileTransferService } from './fileTransferService.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';

export class FileTransferServiceImpl implements FileTransferService {
  public constructor(private readonly s3Service: S3Service) {}

  public async downloadFile(payload: DownloadFilePayload): Promise<void> {
    const { s3Bucket, s3ObjectKey, destinationPath } = payload;

    const videoData = await this.s3Service.getObject({
      bucket: s3Bucket,
      objectKey: s3ObjectKey,
    });

    if (!videoData) {
      throw new ResourceNotFoundError({
        name: 'S3Object',
        bucket: s3Bucket,
        objectKey: s3ObjectKey,
      });
    }

    const writeStream = createWriteStream(destinationPath);

    videoData.pipe(writeStream);
  }

  public async uploadFile(payload: UploadFilePayload): Promise<void> {
    const { s3Bucket, s3ObjectKey, sourcePath } = payload;

    if (!existsSync(sourcePath)) {
      throw new ResourceNotFoundError({
        name: 'File',
        path: sourcePath,
      });
    }

    await this.s3Service.putObject({
      bucket: s3Bucket,
      objectKey: s3ObjectKey,
      data: createReadStream(sourcePath),
    });
  }
}
