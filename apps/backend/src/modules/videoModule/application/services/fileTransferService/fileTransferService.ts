export interface DownloadFilePayload {
  readonly s3Bucket: string;
  readonly s3ObjectKey: string;
  readonly destinationPath: string;
}

export interface UploadFilePayload {
  readonly s3Bucket: string;
  readonly s3ObjectKey: string;
  readonly sourcePath: string;
}

export interface FileTransferService {
  downloadFile(payload: DownloadFilePayload): Promise<void>;
  uploadFile(payload: UploadFilePayload): Promise<void>;
}
