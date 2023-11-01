import { existsSync } from 'fs';
import { mkdir, rm } from 'node:fs/promises';
import path, { join } from 'path';
import { beforeEach, expect, describe, it, afterEach } from 'vitest';

import { type FileTransferService } from './fileTransferService.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Generator } from '../../../../../common/tests/generator.js';
import { Application } from '../../../../../core/application.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type S3Service } from '../../../../../libs/s3/services/s3Service/s3Service.js';
import { symbols } from '../../../symbols.js';

describe('FileTransferServiceImpl', () => {
  let container: DependencyInjectionContainer;

  let fileTransferService: FileTransferService;

  let s3Service: S3Service;

  const resourcesDirectory = join(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', 'resources');

  const testDataDirectory = join(__dirname, 'testData');

  const sampleFileName1 = 'sample_file1.mp4';

  const sampleFileName2 = 'sample_file2.mp4';

  const existingS3Bucket = 'videos';

  beforeEach(async () => {
    if (existsSync(testDataDirectory)) {
      await rm(testDataDirectory, { recursive: true });
    }

    await mkdir(testDataDirectory);

    container = Application.createContainer();

    fileTransferService = container.get<FileTransferService>(symbols.fileTransferService);

    s3Service = container.get<S3Service>(coreSymbols.s3Service);
  });

  afterEach(async () => {
    await rm(testDataDirectory, { recursive: true });
  });

  describe('download', () => {
    it('throws an error - when s3 bucket does not exist', async () => {
      const s3Bucket = Generator.word();

      try {
        await fileTransferService.downloadFileFromS3({
          s3Bucket,
          s3ObjectKey: sampleFileName1,
          destinationFilePath: testDataDirectory,
        });
      } catch (error) {
        expect(error instanceof ResourceNotFoundError);

        return;
      }

      expect.fail();
    });

    it('throws an error - when s3 object does not exist', async () => {
      const s3ObjectKey = Generator.word();

      try {
        await fileTransferService.downloadFileFromS3({
          s3Bucket: existingS3Bucket,
          s3ObjectKey,
          destinationFilePath: testDataDirectory,
        });
      } catch (error) {
        expect(error instanceof ResourceNotFoundError);

        return;
      }

      expect.fail();
    });

    it('downloads a file from s3 to filesystem', async () => {
      const destinationFilePath = path.join(testDataDirectory, sampleFileName1);

      await fileTransferService.downloadFileFromS3({
        s3Bucket: existingS3Bucket,
        s3ObjectKey: sampleFileName1,
        destinationFilePath,
      });

      expect(existsSync(destinationFilePath));
    });
  });

  describe('upload', async () => {
    it('throws an error - when s3 bucket does not exist', async () => {
      const s3Bucket = Generator.word();

      const filePath = path.join(resourcesDirectory, sampleFileName2);

      try {
        await fileTransferService.uploadFileToS3({
          s3Bucket,
          s3ObjectKey: sampleFileName2,
          filePath,
        });
      } catch (error) {
        expect(error instanceof ResourceNotFoundError);

        return;
      }

      expect.fail();
    });

    it('throws an error - when source path does not exist', async () => {
      const filePath = 'invalid';

      try {
        await fileTransferService.uploadFileToS3({
          s3Bucket: existingS3Bucket,
          s3ObjectKey: sampleFileName2,
          filePath,
        });
      } catch (error) {
        expect(error instanceof ResourceNotFoundError);

        return;
      }

      expect.fail();
    });

    it('uploads a file from filesystem to s3', async () => {
      const filePath = path.join(resourcesDirectory, sampleFileName2);

      await fileTransferService.uploadFileToS3({
        s3Bucket: existingS3Bucket,
        s3ObjectKey: sampleFileName2,
        filePath,
      });

      const fileExists = await s3Service.checkIfObjectExists({
        bucket: existingS3Bucket,
        objectKey: sampleFileName2,
      });

      expect(fileExists).toBe(true);
    });
  });
});
