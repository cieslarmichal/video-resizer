/* eslint-disable @typescript-eslint/naming-convention */
import { type UrlRecordMapper } from './urlRecordMapper.js';
import { UrlRecord } from '../../../../domain/entities/urlRecord/urlRecord.js';
import { type UrlRecordRawEntity } from '../../../entities/urlRecordRawEntity.js';

export class UrlRecordMapperImpl implements UrlRecordMapper {
  public mapToDomain(entity: UrlRecordRawEntity): UrlRecord {
    const { createdAt, shortUrl, longUrl } = entity;

    return new UrlRecord({
      createdAt,
      shortUrl,
      longUrl,
    });
  }
}
