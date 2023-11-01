import { type VideoResolution } from '../../../../../common/types/videoResolution.js';

export interface ResizeVideoPayload {
  readonly sourcePath: string;
  readonly destinationPath: string;
  readonly resolution: VideoResolution;
}

export interface VideoResizerService {
  resizeVideo(payload: ResizeVideoPayload): Promise<void>;
}
