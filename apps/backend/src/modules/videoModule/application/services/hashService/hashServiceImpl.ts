import { createHash } from 'node:crypto';

import { type HashService } from './hashService.js';

export class HashServiceImpl implements HashService {
  public async hash(data: string): Promise<string> {
    return createHash('md5').update(data).digest('hex');
  }
}
