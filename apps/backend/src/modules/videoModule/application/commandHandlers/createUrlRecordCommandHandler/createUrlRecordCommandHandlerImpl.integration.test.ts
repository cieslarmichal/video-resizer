import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateUrlRecordCommandHandlerImpl } from './createUrlRecordCommandHandlerImpl.js';
import { Application } from '../../../../../core/application.js';
import { symbols } from '../../../symbols.js';
import { UrlRecordRawEntityTestFactory } from '../../../tests/factories/urlRecordRawEntityTestFactory/urlRecordRawEntityTestFactory.js';
import { MongoDbTestUtils } from '../../../tests/utils/mongoDbTestUtils/mongoDbTestUtils.js';
import { UrlRecordTestUtils } from '../../../tests/utils/urlRecordTestUtils/urlRecordTestUtils.js';

describe('CreateUrlRecordCommandHandler', () => {
  let createUrlRecordCommandHandler: CreateUrlRecordCommandHandlerImpl;

  const urlRecordTestUtils = new UrlRecordTestUtils();

  const mongoDbTestUtils = new MongoDbTestUtils();

  const urlRecordRawEntityTestFactory = new UrlRecordRawEntityTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    createUrlRecordCommandHandler = container.get<CreateUrlRecordCommandHandlerImpl>(
      symbols.createUrlRecordCommandHandler,
    );

    await mongoDbTestUtils.connect();

    await urlRecordTestUtils.truncate();
  });

  afterEach(async () => {
    await urlRecordTestUtils.truncate();

    await mongoDbTestUtils.disconnect();
  });

  it('creates an UrlRecord', async () => {
    const { longUrl } = urlRecordRawEntityTestFactory.create();

    const { urlRecord } = await createUrlRecordCommandHandler.execute({
      longUrl,
    });

    const foundUrlRecord = await urlRecordTestUtils.findByLongUrl({ longUrl: urlRecord.getLongUrl() });

    expect(foundUrlRecord).not.toBeNull();

    expect(foundUrlRecord?.longUrl).toEqual(longUrl);
  });

  it('does not create new UrlRecord - when UrlRecord with the same url already exists', async () => {
    const urlRecord = await urlRecordTestUtils.createAndPersist();

    const existingUrlRecordsBefore = await urlRecordTestUtils.findAll();

    await createUrlRecordCommandHandler.execute({
      longUrl: urlRecord.longUrl,
    });

    const existingUrlRecordsAfter = await urlRecordTestUtils.findAll();

    expect(existingUrlRecordsBefore.length).toEqual(existingUrlRecordsAfter.length);
  });
});
