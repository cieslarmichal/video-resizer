import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface ExecutePayload {
  readonly longUrl: string;
}

export type ResizeVideoCommandHandler = CommandHandler<ExecutePayload, void>;
