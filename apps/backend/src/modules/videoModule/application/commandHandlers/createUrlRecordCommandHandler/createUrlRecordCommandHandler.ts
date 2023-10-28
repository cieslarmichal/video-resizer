import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type UrlRecord } from '../../../domain/entities/urlRecord/urlRecord.js';

export interface ExecutePayload {
  readonly longUrl: string;
}

export interface ExecuteResult {
  readonly urlRecord: UrlRecord;
}

export type CreateUrlRecordCommandHandler = CommandHandler<ExecutePayload, ExecuteResult>;
