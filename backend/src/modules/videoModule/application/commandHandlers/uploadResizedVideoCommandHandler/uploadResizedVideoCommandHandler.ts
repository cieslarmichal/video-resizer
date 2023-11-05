import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type VideoResolution } from '../../../../../common/types/videoResolution.js';

export interface ExecutePayload {
  readonly s3VideosBucket: string;
  readonly s3VideoKey: string;
  readonly resolution: VideoResolution;
}

export type UploadResizedVideoCommandHandler = CommandHandler<ExecutePayload, void>;
