import {
  type CreateUrlRecordCommandHandler,
  type ExecutePayload,
  type ExecuteResult,
} from './resizeVideoCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UrlRecordRepository } from '../../../domain/repositories/urlRecordRepository/urlRecordRepository.js';
import { type UrlModuleConfig } from '../../../videoModuleConfig.js';
import { type EncoderService } from '../../services/encoderService/encoderService.js';
import { type HashService } from '../../services/hashService/hashService.js';

export class CreateUrlRecordCommandHandlerImpl implements CreateUrlRecordCommandHandler {
  public constructor(
    private readonly urlRecordRepository: UrlRecordRepository,
    private readonly hashService: HashService,
    private readonly loggerService: LoggerService,
    private readonly config: UrlModuleConfig,
    private readonly encoderService: EncoderService,
  ) {}

  public async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    const { longUrl } = payload;

    this.loggerService.debug({
      message: 'Creating UrlRecord...',
      context: { longUrl },
    });

    const existingUrlRecord = await this.urlRecordRepository.find({ longUrl });

    if (existingUrlRecord) {
      return { urlRecord: existingUrlRecord };
    }

    const shortUrl = await this.findAvailableShortUrl(longUrl);

    const urlRecord = await this.urlRecordRepository.create({
      longUrl,
      shortUrl,
    });

    this.loggerService.info({
      message: 'UrlRecord created.',
      context: {
        longUrl: urlRecord.getLongUrl(),
        shortUrl: urlRecord.getShortUrl(),
      },
    });

    return { urlRecord };
  }

  private async findAvailableShortUrl(longUrl: string): Promise<string> {
    const shortUrlPathParam = await this.getShortUrlPathParam(longUrl);

    const shortUrl = `${this.config.domainUrl}/${shortUrlPathParam}`;

    const existingUrlRecord = await this.urlRecordRepository.find({ shortUrl });

    if (existingUrlRecord) {
      return this.findAvailableShortUrl(longUrl + '38a17ds4c');
    }

    return shortUrl;
  }

  public async getShortUrlPathParam(longUrl: string): Promise<string> {
    const hashHex = await this.hashService.hash(longUrl);

    const hashDecimal = BigInt(parseInt(hashHex, 16));

    const encodedHash = this.encoderService.encodeBase62(hashDecimal);

    return encodedHash.slice(0, 7);
  }
}
