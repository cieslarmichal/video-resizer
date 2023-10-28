export interface UrlRecordDraft {
  readonly createdAt: Date;
  readonly shortUrl: string;
  readonly longUrl: string;
}

export class UrlRecord {
  private readonly createdAt: Date;
  private readonly shortUrl: string;
  private readonly longUrl: string;

  public constructor(draft: UrlRecordDraft) {
    const { createdAt, shortUrl, longUrl } = draft;

    this.createdAt = createdAt;

    this.shortUrl = shortUrl;

    this.longUrl = longUrl;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getShortUrl(): string {
    return this.shortUrl;
  }

  public getLongUrl(): string {
    return this.longUrl;
  }
}
