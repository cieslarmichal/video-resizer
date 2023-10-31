import { type Readable } from 'node:stream';

export interface PutObjectPayload {
  readonly bucket: string;
  readonly objectKey: string;
  readonly data: Readable;
}

export interface GetObjectPayload {
  readonly bucket: string;
  readonly objectKey: string;
}

export interface S3Service {
  putObject(payload: PutObjectPayload): Promise<void>;
  getObject(payload: GetObjectPayload): Promise<Readable | undefined>;
}
