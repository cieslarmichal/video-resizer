/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, existsSync } from 'node:fs';

import { type ResizeVideoPayload, type VideoResizerService } from './videoResizerService.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';

export class VideoResizerServiceImpl implements VideoResizerService {
  private readonly videoResolutionToResolutionWidthMapping = new Map<VideoResolution, number>([
    [VideoResolution.standardDefinition360, 360],
    [VideoResolution.standardDefinition480, 480],
    [VideoResolution.highDefinition, 720],
  ]);

  public async resizeVideo(payload: ResizeVideoPayload): Promise<void> {
    const { sourcePath, destinationPath, resolution } = payload;

    if (!existsSync(sourcePath)) {
      throw new ResourceNotFoundError({
        name: 'File',
        path: sourcePath,
      });
    }

    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

    const resolutionWidth = this.videoResolutionToResolutionWidthMapping.get(resolution) as number;

    ffmpeg()
      .input(sourcePath)
      .outputOptions('-vf', `scale=-2:${resolutionWidth}`)
      .pipe(createWriteStream(destinationPath));
  }
}
