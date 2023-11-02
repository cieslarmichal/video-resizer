/* eslint-disable import/no-named-as-default-member */

import ffprobe from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import { existsSync } from 'fs';
import { mkdir, rm } from 'node:fs/promises';
import path, { join } from 'path';
import { beforeEach, expect, describe, it, afterEach } from 'vitest';

import { type VideoResizerService } from './videoResizerService.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';
import { Application } from '../../../../../core/application.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { symbols } from '../../../symbols.js';

describe('VideoResizerServiceImpl', () => {
  let container: DependencyInjectionContainer;

  let videoResizerService: VideoResizerService;

  const resourcesDirectory = join(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', 'resources');

  const testDataDirectory = join(__dirname, 'testData');

  const sampleFileName = 'sample_file1.mp4';

  const sampleFilePath = path.join(resourcesDirectory, sampleFileName);

  beforeEach(async () => {
    if (existsSync(testDataDirectory)) {
      await rm(testDataDirectory, { recursive: true });
    }

    await mkdir(testDataDirectory);

    container = Application.createContainer();

    videoResizerService = container.get<VideoResizerService>(symbols.videoResizerService);
  });

  afterEach(async () => {
    await rm(testDataDirectory, { recursive: true });
  });

  it('throws an error - when source path does not exist', async () => {
    const sourceFilePath = 'invalid';

    const destinationFilePath = path.join(testDataDirectory, sampleFileName);

    try {
      await videoResizerService.resizeVideo({
        destinationFilePath,
        sourceFilePath,
        resolution: VideoResolution.standardDefinition360,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('resizes video to 360p', async () => {
    const destinationFilePath = path.join(testDataDirectory, sampleFileName);

    await videoResizerService.resizeVideo({
      sourceFilePath: sampleFilePath,
      destinationFilePath,
      resolution: VideoResolution.standardDefinition360,
    });

    expect(existsSync(destinationFilePath));

    ffmpeg().setFfprobePath(ffprobe.path);

    const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(destinationFilePath, function (err, metadata) {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });

    const { width, height } = metadata.streams[0] as ffmpeg.FfprobeStream;

    expect(height).toEqual(360);

    expect(width).toEqual(640);
  });

  it('resizes video to 480p', async () => {
    const destinationFilePath = path.join(testDataDirectory, sampleFileName);

    await videoResizerService.resizeVideo({
      sourceFilePath: sampleFilePath,
      destinationFilePath,
      resolution: VideoResolution.standardDefinition480,
    });

    expect(existsSync(destinationFilePath));

    ffmpeg().setFfprobePath(ffprobe.path);

    const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(destinationFilePath, function (err, metadata) {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });

    const { width, height } = metadata.streams[0] as ffmpeg.FfprobeStream;

    expect(height).toEqual(480);

    expect(width).toEqual(854);
  });

  it('resizes video to 720p', async () => {
    const destinationFilePath = path.join(testDataDirectory, sampleFileName);

    await videoResizerService.resizeVideo({
      sourceFilePath: sampleFilePath,
      destinationFilePath,
      resolution: VideoResolution.highDefinition,
    });

    expect(existsSync(destinationFilePath));

    ffmpeg().setFfprobePath(ffprobe.path);

    const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(destinationFilePath, function (err, metadata) {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });

    const { width, height } = metadata.streams[0] as ffmpeg.FfprobeStream;

    expect(height).toEqual(720);

    expect(width).toEqual(1280);
  });
});
