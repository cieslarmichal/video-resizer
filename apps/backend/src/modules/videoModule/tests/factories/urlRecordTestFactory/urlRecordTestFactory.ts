import { Generator } from '../../../../../common/tests/generator.js';
import { UrlRecord } from '../../../domain/entities/urlRecord/urlRecord.js';

export class UrlRecordTestFactory {
  public create(input: Partial<UrlRecord> = {}): UrlRecord {
    return new UrlRecord({
      createdAt: Generator.pastDate(),
      longUrl: Generator.url(),
      shortUrl: Generator.url(),
      ...input,
    });
  }
}
