import { type UrlRecord } from '../../../domain/entities/urlRecord/urlRecord.js';

export interface CreatePayload {
  readonly shortUrl: string;
  readonly longUrl: string;
}

export interface FindPayload {
  readonly shortUrl?: string;
  readonly longUrl?: string;
}

export interface UrlRecordRepository {
  create(input: CreatePayload): Promise<UrlRecord>;
  find(input: FindPayload): Promise<UrlRecord | null>;
}
