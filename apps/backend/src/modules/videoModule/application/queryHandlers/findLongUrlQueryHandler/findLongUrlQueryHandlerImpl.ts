import { type FindLongUrlQueryHandler, type ExecutePayload, type ExecuteResult } from './findLongUrlQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type KafkaProducerService } from '../../../../../libs/kafka/services/kafkaProducerService/kafkaProducerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type UrlRecordRepository } from '../../../domain/repositories/urlRecordRepository/urlRecordRepository.js';

export class FindLongUrlQueryHandlerImpl implements FindLongUrlQueryHandler {
  private readonly urlClicksKafkaTopic = 'url-clicks';

  public constructor(
    private readonly urlRecordRepository: UrlRecordRepository,
    private readonly uuidService: UuidService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { shortUrl, clientIp } = payload;

    const urlRecord = await this.urlRecordRepository.find({ shortUrl });

    if (!urlRecord) {
      throw new ResourceNotFoundError({
        name: 'UrlRecord',
        shortUrl,
      });
    }

    console.log({ clientIp });

    await this.kafkaProducerService.sendMessage({
      topic: this.urlClicksKafkaTopic,
      message: JSON.stringify({
        id: this.uuidService.generateUuid(),
        data: {
          shortUrl: urlRecord.getShortUrl(),
          longUrl: urlRecord.getLongUrl(),
          seenAt: new Date().toISOString(),
          clientIp,
        },
      }),
    });

    return { longUrl: urlRecord.getLongUrl() };
  }
}
