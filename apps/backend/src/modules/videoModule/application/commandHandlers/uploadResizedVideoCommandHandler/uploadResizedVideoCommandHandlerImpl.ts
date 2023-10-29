import { type UploadResizedVideoCommandHandler, type ExecutePayload } from './updoadResizedVideoCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import { type VideoModuleConfig } from '../../../videoModuleConfig.js';

export class UploadResizedVideoCommandHandlerImpl implements UploadResizedVideoCommandHandler {
  public constructor(
    private readonly s3Service: S3Service,
    private readonly config: VideoModuleConfig,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { s3VideosBucketName: sourceBucket, s3VideoObjectKey: sourceObjectKey, targetVideoResolution } = payload;

    const { s3ResizedVideosBucketName: targetBucket } = this.config;

    this.loggerService.debug({
      message: 'Resizing video...',
      context: {
        sourceBucket,
        sourceObjectKey,
        targetVideoResolution,
      },
    });

    this.loggerService.info({
      message: 'Video resized.',
      context: {
        sourceBucket,
        sourceObjectKey,
        targetVideoResolution,
      },
    });

    const targetObjectKey = 'x';

    this.loggerService.debug({
      message: 'Uploading video...',
      context: {
        targetObjectKey,
        targetBucket,
      },
    });

    this.loggerService.info({
      message: 'Video uploaded.',
      context: {
        targetObjectKey,
        targetBucket,
      },
    });
  }
}
