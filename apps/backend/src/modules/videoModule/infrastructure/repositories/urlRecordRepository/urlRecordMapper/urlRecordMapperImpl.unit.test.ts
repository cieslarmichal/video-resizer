import { beforeEach, expect, describe, it } from 'vitest';

import { UrlRecordMapperImpl } from './urlRecordMapperImpl.js';
import { UrlRecordRawEntityTestFactory } from '../../../../tests/factories/urlRecordRawEntityTestFactory/urlRecordRawEntityTestFactory.js';

describe('UrlRecordMapperImpl', () => {
  let urlRecordMapperImpl: UrlRecordMapperImpl;

  const urlRecordEntityTestFactory = new UrlRecordRawEntityTestFactory();

  beforeEach(async () => {
    urlRecordMapperImpl = new UrlRecordMapperImpl();
  });

  it('maps from UrlRecordRawEntity to UrlRecord', async () => {
    const urlRecordEntity = urlRecordEntityTestFactory.create();

    const urlRecord = urlRecordMapperImpl.mapToDomain(urlRecordEntity);

    expect(urlRecord).toMatchObject({
      createdAt: urlRecordEntity.createdAt,
      shortUrl: urlRecordEntity.shortUrl,
      longUrl: urlRecordEntity.longUrl,
    });
  });
});
