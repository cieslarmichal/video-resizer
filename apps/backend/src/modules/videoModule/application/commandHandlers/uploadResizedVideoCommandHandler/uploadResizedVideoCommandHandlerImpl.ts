import path from 'node:path';

import { type UploadResizedVideoCommandHandler, type ExecutePayload } from './uploadResizedVideoCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type VideoModuleConfig } from '../../../videoModuleConfig.js';
import { type FileTransferService } from '../../services/fileTransferService/fileTransferService.js';
import { type VideoResizerService } from '../../services/videoResizerService/videoResizerService.js';

export class UploadResizedVideoCommandHandlerImpl implements UploadResizedVideoCommandHandler {
  public constructor(
    private readonly fileTransferService: FileTransferService,
    private readonly videoResizerService: VideoResizerService,
    private readonly config: VideoModuleConfig,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { s3VideosBucket, s3VideoKey, resolution } = payload;

    const videoPath = `/tmp/${s3VideoKey}`;

    await this.fileTransferService.downloadFile({
      s3Bucket: s3VideosBucket,
      s3ObjectKey: s3VideoKey,
      destinationPath: videoPath,
    });

    this.loggerService.info({
      message: 'Video downloaded.',
      context: {
        bucket: s3VideosBucket,
        objectKey: s3VideoKey,
        videoPath,
      },
    });

    const parsedVideoPath = path.parse(s3VideoKey);

    const s3ResizedVideoKey = `${parsedVideoPath.name}-${resolution}${parsedVideoPath.ext}`;

    const resizedVideoPath = `/tmp/${s3ResizedVideoKey}`;

    await this.videoResizerService.resizeVideo({
      sourcePath: videoPath,
      destinationPath: resizedVideoPath,
      resolution,
    });

    this.loggerService.info({
      message: 'Video resized.',
      context: {
        videoPath,
        resizedVideoPath,
        resolution,
      },
    });

    const { s3ResizedVideosBucket } = this.config;

    await this.fileTransferService.uploadFile({
      s3Bucket: s3ResizedVideosBucket,
      s3ObjectKey: s3VideoKey,
      sourcePath: resizedVideoPath,
    });

    this.loggerService.info({
      message: 'Video uploaded.',
      context: {
        bucket: s3VideosBucket,
        objectKey: s3ResizedVideoKey,
        resizedVideoPath,
      },
    });
  }
}
