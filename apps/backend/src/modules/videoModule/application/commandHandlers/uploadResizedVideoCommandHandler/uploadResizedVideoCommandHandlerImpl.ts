/* eslint-disable import/no-named-as-default-member */
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { createReadStream, createWriteStream } from 'node:fs';

import { type UploadResizedVideoCommandHandler, type ExecutePayload } from './uploadResizedVideoCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import { type VideoModuleConfig } from '../../../videoModuleConfig.js';

interface DownloadVideoPayload {
  readonly s3VideosBucket: string;
  readonly s3VideoKey: string;
  readonly destinationPath: string;
}

interface ResizeVideoPayload {
  readonly sourcePath: string;
  readonly destinationPath: string;
  readonly targetResolution: VideoResolution;
}

interface UploadVideoPayload {
  readonly s3VideosBucket: string;
  readonly s3VideoKey: string;
  readonly sourcePath: string;
}

export class UploadResizedVideoCommandHandlerImpl implements UploadResizedVideoCommandHandler {
  private readonly videoResolutionToResolutionWidthMapping = new Map<VideoResolution, number>([
    [VideoResolution.standardDefinition360, 360],
    [VideoResolution.standardDefinition480, 480],
    [VideoResolution.highDefinition, 720],
  ]);

  public constructor(
    private readonly s3Service: S3Service,
    private readonly config: VideoModuleConfig,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { s3VideosBucket, s3VideoKey, targetResolution } = payload;

    const { s3ResizedVideosBucket } = this.config;

    const videoPath = `/tmp/${s3VideoKey}`;

    await this.downloadVideo({
      s3VideosBucket,
      s3VideoKey,
      destinationPath: videoPath,
    });

    const s3ResizedVideoKey = s3VideoKey.replace('.mp4', '') + `-${targetResolution}.mp4`;

    const resizedVideoPath = `/tmp/${s3ResizedVideoKey}`;

    await this.resizeVideo({
      sourcePath: videoPath,
      destinationPath: resizedVideoPath,
      targetResolution,
    });

    await this.uploadVideo({
      s3VideosBucket: s3ResizedVideosBucket,
      s3VideoKey: s3ResizedVideoKey,
      sourcePath: resizedVideoPath,
    });
  }

  private async downloadVideo(payload: DownloadVideoPayload): Promise<void> {
    const { s3VideosBucket, s3VideoKey, destinationPath } = payload;

    this.loggerService.debug({
      message: 'Downloading video...',
      context: {
        s3VideosBucket,
        s3VideoKey,
        destinationPath,
      },
    });

    const videoData = await this.s3Service.getObject({
      bucket: s3VideosBucket,
      objectKey: s3VideoKey,
    });

    if (!videoData) {
      throw new ResourceNotFoundError({
        name: 'S3Object',
        bucket: s3VideosBucket,
        objectKey: s3VideoKey,
      });
    }

    const writeStream = createWriteStream(destinationPath);

    videoData.pipe(writeStream);

    this.loggerService.info({
      message: 'Video downloaded.',
      context: {
        bucket: s3VideosBucket,
        objectKey: s3VideoKey,
        videoPath: destinationPath,
      },
    });
  }

  private async resizeVideo(payload: ResizeVideoPayload): Promise<void> {
    const { sourcePath, destinationPath, targetResolution } = payload;

    this.loggerService.debug({
      message: 'Resizing video...',
      context: {
        sourcePath,
        destinationPath,
        targetResolution,
      },
    });

    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

    const resolutionWidth = this.videoResolutionToResolutionWidthMapping.get(targetResolution) as number;

    ffmpeg()
      .input(sourcePath)
      .outputOptions('-vf', `scale=-2:${resolutionWidth}`)
      .pipe(createWriteStream(destinationPath));

    this.loggerService.info({
      message: 'Video resized.',
      context: {
        sourcePath,
        destinationPath,
        targetResolution,
      },
    });
  }

  private async uploadVideo(payload: UploadVideoPayload): Promise<void> {
    const { s3VideosBucket, s3VideoKey, sourcePath } = payload;

    this.loggerService.debug({
      message: 'Uploading video...',
      context: {
        targetBucket: s3VideosBucket,
        targetObjectKey: s3VideoKey,
        sourcePath,
      },
    });

    await this.s3Service.putObject({
      bucket: s3VideosBucket,
      objectKey: s3VideoKey,
      data: createReadStream(sourcePath),
    });

    this.loggerService.info({
      message: 'Video uploaded.',
      context: {
        targetBucket: s3VideosBucket,
        targetObjectKey: s3VideoKey,
        sourcePath,
      },
    });
  }
}
