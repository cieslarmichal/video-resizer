import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindLongUrlQueryHandler } from './findLongUrlQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { symbols } from '../../../symbols.js';
import { UrlRecordRawEntityTestFactory } from '../../../tests/factories/urlRecordRawEntityTestFactory/urlRecordRawEntityTestFactory.js';
import { MongoDbTestUtils } from '../../../tests/utils/mongoDbTestUtils/mongoDbTestUtils.js';
import { UrlRecordTestUtils } from '../../../tests/utils/urlRecordTestUtils/urlRecordTestUtils.js';

describe('FindLongUrlQueryHandler', () => {
  let findLongUrlQueryHandler: FindLongUrlQueryHandler;

  const urlRecordTestUtils = new UrlRecordTestUtils();

  const mongoDbTestUtils = new MongoDbTestUtils();

  const urlRecordEntityTestFactory = new UrlRecordRawEntityTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    findLongUrlQueryHandler = container.get<FindLongUrlQueryHandler>(symbols.findLongUrlQueryHandler);

    await mongoDbTestUtils.connect();

    await urlRecordTestUtils.truncate();
  });

  afterEach(async () => {
    await urlRecordTestUtils.truncate();

    await mongoDbTestUtils.disconnect();
  });

  it('finds UrlRecord by long url', async () => {
    const urlRecord = await urlRecordTestUtils.createAndPersist();

    const clientIp = 'localhost:8080';

    const { longUrl } = await findLongUrlQueryHandler.execute({
      shortUrl: urlRecord.shortUrl,
      clientIp,
    });

    expect(longUrl).toEqual(urlRecord.longUrl);
  });

  it('throws an error if UrlRecord with given short url does not exist', async () => {
    const { shortUrl } = urlRecordEntityTestFactory.create();

    const clientIp = 'localhost:8080';

    try {
      await findLongUrlQueryHandler.execute({
        shortUrl,
        clientIp,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
