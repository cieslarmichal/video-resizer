/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream } from 'node:fs';
import path from 'node:path';

import { type UploadResizedVideoCommandHandler, type ExecutePayload } from './uploadResizedVideoCommandHandler.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type VideoModuleConfig } from '../../../videoModuleConfig.js';
import { type FileTransferService } from '../../services/fileTransferService/fileTransferService.js';

interface ResizeVideoPayload {
  readonly sourcePath: string;
  readonly destinationPath: string;
  readonly targetResolution: VideoResolution;
}

export class UploadResizedVideoCommandHandlerImpl implements UploadResizedVideoCommandHandler {
  private readonly videoResolutionToResolutionWidthMapping = new Map<VideoResolution, number>([
    [VideoResolution.standardDefinition360, 360],
    [VideoResolution.standardDefinition480, 480],
    [VideoResolution.highDefinition, 720],
  ]);

  public constructor(
    private readonly fileTransferService: FileTransferService,
    private readonly config: VideoModuleConfig,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<void> {
    const { s3VideosBucket, s3VideoKey, targetResolution } = payload;

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

    const s3ResizedVideoKey = `${parsedVideoPath.name}-${targetResolution}${parsedVideoPath.ext}`;

    const resizedVideoPath = `/tmp/${s3ResizedVideoKey}`;

    await this.resizeVideo({
      sourcePath: videoPath,
      destinationPath: resizedVideoPath,
      targetResolution,
    });

    this.loggerService.info({
      message: 'Video resized.',
      context: {
        videoPath,
        resizedVideoPath,
        targetResolution,
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

  private async resizeVideo(payload: ResizeVideoPayload): Promise<void> {
    const { sourcePath, destinationPath, targetResolution } = payload;

    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

    const resolutionWidth = this.videoResolutionToResolutionWidthMapping.get(targetResolution) as number;

    ffmpeg()
      .input(sourcePath)
      .outputOptions('-vf', `scale=-2:${resolutionWidth}`)
      .pipe(createWriteStream(destinationPath));
  }
}
