import { expect, describe, it } from 'vitest';

import { EncoderServiceImpl } from './encoderServiceImpl.js';

describe('EncoderServiceImpl', () => {
  const encoderServiceImpl = new EncoderServiceImpl();

  it('encodes decimal number to base62', async () => {
    const input = 300425841013440728375110153172093501440n;

    const encoded = encoderServiceImpl.encodeBase62(input);

    expect(encoded).toEqual('6sU3Kx1ZruPscXzvXU4NHc');
  });

  it('encodes other decimal number to base62', async () => {
    const input = 319067991216649953579382280290069118976n;

    const encoded = encoderServiceImpl.encodeBase62(input);

    expect(encoded).toEqual('7IwqWoCiSih36hCy0o8VVY');
  });
});
