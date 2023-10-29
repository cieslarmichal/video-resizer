import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type VideoResolution } from '../../../../../common/types/videoResolution.js';

export interface ExecutePayload {
  readonly s3VideosBucketName: string;
  readonly s3VideoObjectKey: string;
  readonly targetVideoResolution: VideoResolution;
}

export type UploadResizedVideoCommandHandler = CommandHandler<ExecutePayload, void>;
