/* eslint-disable import/no-named-as-default-member */

import ffmpeg from 'fluent-ffmpeg';
import { existsSync } from 'fs';
import { rm } from 'node:fs/promises';
import { beforeEach, expect, describe, it, afterEach } from 'vitest';

import { type UploadResizedVideoCommandHandler } from './uploadResizedVideoCommandHandler.js';
import { VideoResolution } from '../../../../../common/types/videoResolution.js';
import { Application } from '../../../../../core/application.js';
import { ConfigProvider } from '../../../../../core/configProvider.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import { symbols } from '../../../symbols.js';

describe('UploadResizedVideoCommandHandlerImpl', () => {
  let container: DependencyInjectionContainer;

  let uploadResizedVideoCommandHandler: UploadResizedVideoCommandHandler;

  let s3Service: S3Service;

  const s3VideoKey = 'sample_file1.mp4';

  const s3ResizedVideoKey = 'sample_file1-720p.mp4';

  const s3VideosBucket = 'videos';

  const s3ResizedVideosBucket = 'resized-videos';

  const downloadPath = `/tmp/${s3VideoKey}`;

  const uploadPath = `/tmp/${s3ResizedVideoKey}`;

  const ffprobePath = ConfigProvider.getFfprobePath();

  beforeEach(async () => {
    if (existsSync(downloadPath)) {
      await rm(downloadPath);
    }

    if (existsSync(uploadPath)) {
      await rm(uploadPath);
    }

    container = Application.createContainer();

    uploadResizedVideoCommandHandler = container.get<UploadResizedVideoCommandHandler>(
      symbols.uploadResizedVideoCommandHandler,
    );

    s3Service = container.get<S3Service>(coreSymbols.s3Service);

    if (
      await s3Service.checkIfObjectExists({
        bucket: s3ResizedVideosBucket,
        objectKey: s3ResizedVideoKey,
      })
    ) {
      await s3Service.deleteObject({
        bucket: s3ResizedVideosBucket,
        objectKey: s3ResizedVideoKey,
      });
    }
  });

  afterEach(async () => {
    await rm(downloadPath);

    await rm(uploadPath);

    if (
      await s3Service.checkIfObjectExists({
        bucket: s3ResizedVideosBucket,
        objectKey: s3ResizedVideoKey,
      })
    ) {
      await s3Service.deleteObject({
        bucket: s3ResizedVideosBucket,
        objectKey: s3ResizedVideoKey,
      });
    }
  });

  it('downloads a video from s3 then resizes to given resolution and uploads to s3', async () => {
    await uploadResizedVideoCommandHandler.execute({
      s3VideoKey,
      s3VideosBucket,
      resolution: VideoResolution.highDefinition,
    });

    expect(existsSync(downloadPath));

    expect(existsSync(uploadPath));

    ffmpeg().setFfprobePath(ffprobePath);

    const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(uploadPath, function (err, metadata) {
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

    const resizedVideoExistsInS3 = await s3Service.checkIfObjectExists({
      bucket: s3ResizedVideosBucket,
      objectKey: s3ResizedVideoKey,
    });

    expect(resizedVideoExistsInS3).toBe(true);
  });
});
