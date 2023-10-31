import { type Readable } from 'node:stream';

export interface UploadObjectPayload {
  readonly bucketName: string;
  readonly objectKey: string;
  readonly data: Readable;
}

export interface DownloadObjectPayload {
  readonly bucketName: string;
  readonly objectKey: string;
  readonly destinationPath: string;
}

export interface S3Service {
  uploadObject(payload: UploadObjectPayload): Promise<void>;
  downloadObject(payload: DownloadObjectPayload): Promise<void>;
}
