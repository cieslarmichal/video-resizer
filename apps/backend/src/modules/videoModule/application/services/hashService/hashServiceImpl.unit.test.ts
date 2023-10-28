import { expect, describe, it } from 'vitest';

import { HashServiceImpl } from './hashServiceImpl.js';

describe('HashServiceImpl', () => {
  const hashServiceImpl = new HashServiceImpl();

  it('hashes string', async () => {
    const input = 'https://www.facebook.com';

    const hash = await hashServiceImpl.hash(input);

    expect(hash).toEqual('a24a5be7a6076556c8c2f16e5065bd40');
  });

  it('hashes other string', async () => {
    const input = 'https://github.com/cieslarmichal';

    const hash = await hashServiceImpl.hash(input);

    expect(hash).toEqual('d7645cf86ca2fd034f2a0fc005c361a2');
  });
});
