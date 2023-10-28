export interface HashService {
  hash(data: string): Promise<string>;
}
