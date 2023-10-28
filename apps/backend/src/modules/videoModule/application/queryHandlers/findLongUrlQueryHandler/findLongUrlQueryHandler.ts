import { type QueryHandler } from '../../../../../common/types/queryHandler.js';

export interface ExecutePayload {
  readonly shortUrl: string;
  readonly clientIp: string;
}

export interface ExecuteResult {
  readonly longUrl: string;
}

export type FindLongUrlQueryHandler = QueryHandler<ExecutePayload, ExecuteResult>;
