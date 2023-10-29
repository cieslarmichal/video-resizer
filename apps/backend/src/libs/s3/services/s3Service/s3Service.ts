export interface UploadObjectPayload {
  readonly bucketName: string;
  readonly objectKey: string;
  readonly data: Buffer;
}

export interface DownloadObjectPayload {
  readonly bucketName: string;
  readonly objectKey: string;
}

export interface S3Service {
  uploadObject(payload: UploadObjectPayload): Promise<void>;
  downloadObject(payload: DownloadObjectPayload): Promise<void>;
}
