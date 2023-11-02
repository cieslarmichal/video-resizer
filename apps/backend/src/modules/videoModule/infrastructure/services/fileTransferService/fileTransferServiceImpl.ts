import { createReadStream, createWriteStream, existsSync } from 'node:fs';

import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import {
  type FileTransferService,
  type DownloadFileFromS3Payload,
  type UploadFileToS3Payload,
} from '../../../application/services/fileTransferService/fileTransferService.js';

export class FileTransferServiceImpl implements FileTransferService {
  public constructor(private readonly s3Service: S3Service) {}

  public async downloadFileFromS3(payload: DownloadFileFromS3Payload): Promise<void> {
    const { s3Bucket, s3ObjectKey, destinationFilePath } = payload;

    const videoData = await this.s3Service.getObjectData({
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

    videoData.pipe(createWriteStream(destinationFilePath));
  }

  public async uploadFileToS3(payload: UploadFileToS3Payload): Promise<void> {
    const { s3Bucket, s3ObjectKey, filePath } = payload;

    if (!existsSync(filePath)) {
      throw new ResourceNotFoundError({
        name: 'File',
        filePath,
      });
    }

    await this.s3Service.putObject({
      bucket: s3Bucket,
      objectKey: s3ObjectKey,
      data: createReadStream(filePath),
    });
  }
}
