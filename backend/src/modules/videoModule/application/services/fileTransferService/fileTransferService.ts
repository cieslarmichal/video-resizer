export interface DownloadFileFromS3Payload {
  readonly s3Bucket: string;
  readonly s3ObjectKey: string;
  readonly destinationFilePath: string;
}

export interface UploadFileToS3Payload {
  readonly s3Bucket: string;
  readonly s3ObjectKey: string;
  readonly filePath: string;
}

export interface FileTransferService {
  downloadFileFromS3(payload: DownloadFileFromS3Payload): Promise<void>;
  uploadFileToS3(payload: UploadFileToS3Payload): Promise<void>;
}
