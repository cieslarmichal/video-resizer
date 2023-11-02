/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { existsSync } from 'node:fs';

import { type ResizeVideoPayload, type VideoResizerService } from './videoResizerService.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';

export class VideoResizerServiceImpl implements VideoResizerService {
  private readonly videoResolutionToResolutionHeightMapping = new Map<VideoResolution, number>([
    [VideoResolution.standardDefinition360, 360],
    [VideoResolution.standardDefinition480, 480],
    [VideoResolution.highDefinition, 720],
  ]);

  public async resizeVideo(payload: ResizeVideoPayload): Promise<void> {
    const { sourceFilePath: sourcePath, destinationFilePath: destinationPath, resolution } = payload;

    if (!existsSync(sourcePath)) {
      throw new ResourceNotFoundError({
        name: 'File',
        path: sourcePath,
      });
    }

    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

    const resolutionHeight = this.videoResolutionToResolutionHeightMapping.get(resolution);

    if (!resolutionHeight) {
      throw new OperationNotValidError({
        reason: 'Target resolution not supported.',
        resolution,
      });
    }

    await new Promise((resolve, reject) => {
      ffmpeg(sourcePath)
        .output(destinationPath)
        .videoCodec('libx264')
        .outputOptions('-vf', `scale=-2:${resolutionHeight}`)
        .on('end', () => resolve('done'))
        .on('error', (err) => reject(err))
        .run();
    });
  }
}
