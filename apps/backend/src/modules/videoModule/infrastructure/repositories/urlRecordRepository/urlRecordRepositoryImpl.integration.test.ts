import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { Generator } from '../../../../../common/tests/generator.js';
import { Application } from '../../../../../core/application.js';
import { type UrlRecordRepository } from '../../../domain/repositories/urlRecordRepository/urlRecordRepository.js';
import { symbols } from '../../../symbols.js';
import { UrlRecordRawEntityTestFactory } from '../../../tests/factories/urlRecordRawEntityTestFactory/urlRecordRawEntityTestFactory.js';
import { MongoDbTestUtils } from '../../../tests/utils/mongoDbTestUtils/mongoDbTestUtils.js';
import { UrlRecordTestUtils } from '../../../tests/utils/urlRecordTestUtils/urlRecordTestUtils.js';
import { type UrlRecordRawEntity } from '../../entities/urlRecordRawEntity.js';

describe('UrlRecordRepositoryImpl', () => {
  let urlRecordRepository: UrlRecordRepository;

  const urlRecordTestUtils = new UrlRecordTestUtils();

  const mongoDbTestUtils = new MongoDbTestUtils();

  const urlRecordRawEntityTestFactory = new UrlRecordRawEntityTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    urlRecordRepository = container.get<UrlRecordRepository>(symbols.urlRecordRepository);

    await mongoDbTestUtils.connect();

    await urlRecordTestUtils.truncate();
  });

  afterEach(async () => {
    await urlRecordTestUtils.truncate();

    await mongoDbTestUtils.disconnect();
  });

  describe('create', () => {
    it('creates an UrlRecord', async () => {
      const urlRecord = urlRecordRawEntityTestFactory.create();

      const createdUrlRecord = await urlRecordRepository.create({
        longUrl: urlRecord.longUrl,
        shortUrl: urlRecord.shortUrl,
      });

      const foundUrlRecord = (await urlRecordTestUtils.findByShortUrl({
        shortUrl: urlRecord.shortUrl,
      })) as UrlRecordRawEntity;

      expect(foundUrlRecord).not.toBeNull();

      expect(foundUrlRecord).toMatchObject({
        id: expect.any(String),
        createdAt: expect.any(Date),
        longUrl: createdUrlRecord.getLongUrl(),
        shortUrl: createdUrlRecord.getShortUrl(),
      });

      expect(foundUrlRecord).toMatchObject({
        createdAt: createdUrlRecord.getCreatedAt(),
        longUrl: createdUrlRecord.getLongUrl(),
        shortUrl: createdUrlRecord.getShortUrl(),
      });
    });

    it('throws an error when UrlRecord with the same urls already exists', async () => {
      const existingUrlRecord = await urlRecordTestUtils.createAndPersist();

      try {
        await urlRecordRepository.create({
          longUrl: existingUrlRecord.longUrl,
          shortUrl: existingUrlRecord.shortUrl,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('find', () => {
    it('finds UrlRecord by short url', async () => {
      const urlRecord = await urlRecordTestUtils.createAndPersist();

      const foundUrlRecord = await urlRecordRepository.find({ shortUrl: urlRecord.shortUrl });

      expect(foundUrlRecord).not.toBeNull();
    });

    it('returns null if UrlRecord with given short url does not exist', async () => {
      const shortUrl = Generator.url();

      const foundUrlRecord = await urlRecordRepository.find({ shortUrl });

      expect(foundUrlRecord).toBeNull();
    });

    it('finds UrlRecord by long url', async () => {
      const urlRecord = await urlRecordTestUtils.createAndPersist();

      const foundUrlRecord = await urlRecordRepository.find({ longUrl: urlRecord.longUrl });

      expect(foundUrlRecord).not.toBeNull();
    });

    it('returns null if UrlRecord with given long url does not exist', async () => {
      const longUrl = Generator.url();

      const foundUrlRecord = await urlRecordRepository.find({ longUrl });

      expect(foundUrlRecord).toBeNull();
    });
  });
});
