/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import { existsSync } from 'node:fs';

import { type ResizeVideoPayload, type VideoResizerService } from './videoResizerService.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';
import { type ProcessExecutorService } from '../processExecutorService/processExecutorService.js';

export class VideoResizerServiceImpl implements VideoResizerService {
  public constructor(private readonly processExecutorService: ProcessExecutorService) {}

  private readonly videoResolutionToPixelDimensionsMapping = new Map<VideoResolution, string>([
    [VideoResolution.standardDefinition360, '640x360'],
    [VideoResolution.standardDefinition480, '854x480'],
    [VideoResolution.highDefinition, '1280x720'],
  ]);

  public async resizeVideo(payload: ResizeVideoPayload): Promise<void> {
    const { sourceFilePath, destinationFilePath, resolution } = payload;

    if (!existsSync(sourceFilePath)) {
      throw new ResourceNotFoundError({
        name: 'File',
        path: sourceFilePath,
      });
    }

    const videPixelDimensions = this.videoResolutionToPixelDimensionsMapping.get(resolution);

    if (!videPixelDimensions) {
      throw new OperationNotValidError({
        reason: 'Target resolution not supported.',
        resolution,
      });
    }

    await this.processExecutorService.execute(ffmpegPath as unknown as string, [
      '-loglevel',
      'error',
      '-y',
      '-i',
      sourceFilePath,
      '-s',
      videPixelDimensions,
      '-f',
      'mp4',
      destinationFilePath,
    ]);
  }
}
