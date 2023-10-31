/* eslint-disable import/no-named-as-default-member */
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { createReadStream, createWriteStream } from 'node:fs';

import { type UploadResizedVideoCommandHandler, type ExecutePayload } from './uploadResizedVideoCommandHandler.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import { type VideoModuleConfig } from '../../../videoModuleConfig.js';

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
    const { s3VideosBucketName: sourceBucket, s3VideoObjectKey: sourceObjectKey, targetVideoResolution } = payload;

    const { s3ResizedVideosBucketName: targetBucket } = this.config;

    this.loggerService.debug({
      message: 'Fetching video...',
      context: {
        sourceBucket,
        sourceObjectKey,
      },
    });

    const videoPath = `/tmp/${sourceObjectKey}`;

    await this.s3Service.downloadObject({
      bucketName: sourceBucket,
      objectKey: sourceObjectKey,
      destinationPath: videoPath,
    });

    this.loggerService.info({
      message: 'Video fetched.',
      context: {
        sourceBucket,
        sourceObjectKey,
        videoPath,
      },
    });

    this.loggerService.debug({
      message: 'Resizing video...',
      context: {
        sourceBucket,
        sourceObjectKey,
        targetVideoResolution,
        videoPath,
      },
    });

    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

    const resolutionWidth = this.videoResolutionToResolutionWidthMapping.get(targetVideoResolution) as number;

    const targetObjectKey = sourceObjectKey.replace('.mp4', '') + `-${resolutionWidth}.mp4`;

    const resizedVideoPath = `/tmp/${targetObjectKey}`;

    ffmpeg()
      .input(videoPath)
      .outputOptions('-vf', `scale=-2:${resolutionWidth}`)
      .pipe(createWriteStream(resizedVideoPath));

    this.loggerService.info({
      message: 'Video resized.',
      context: {
        sourceBucket,
        sourceObjectKey,
        targetVideoResolution,
        videoPath,
        resizedVideoPath,
      },
    });

    this.loggerService.debug({
      message: 'Uploading video...',
      context: {
        targetObjectKey,
        targetBucket,
        resizedVideoPath,
      },
    });

    await this.s3Service.uploadObject({
      bucketName: sourceBucket,
      objectKey: sourceObjectKey,
      data: createReadStream(resizedVideoPath),
    });

    this.loggerService.info({
      message: 'Video uploaded.',
      context: {
        targetObjectKey,
        targetBucket,
        resizedVideoPath,
      },
    });
  }
}
