import { type EncoderService } from './encoderService.js';

export class EncoderServiceImpl implements EncoderService {
  private readonly base62Characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  public encodeBase62(decimalInput: bigint): string {
    const base62 = BigInt(this.base62Characters.length);

    let encoded = '';

    while (decimalInput > 0) {
      const remainder = Number(decimalInput % base62);

      decimalInput /= base62;

      encoded = this.base62Characters[remainder] + encoded;
    }

    return encoded;
  }
}
