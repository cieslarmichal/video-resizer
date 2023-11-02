import { type VideoResolution } from '../../../../../common/types/videoResolution.js';

export interface ResizeVideoPayload {
  readonly sourceFilePath: string;
  readonly destinationFilePath: string;
  readonly resolution: VideoResolution;
}

export interface VideoResizerService {
  resizeVideo(payload: ResizeVideoPayload): Promise<void>;
}
