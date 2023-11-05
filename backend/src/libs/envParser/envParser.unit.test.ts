import { describe, expect, it } from 'vitest';

import { EnvParser } from './envParser.js';
import { Generator } from '../../common/tests/generator.js';

describe('envParserImpl', () => {
  it('parses string', async () => {
    expect.assertions(2);

    const name = Generator.word();

    process.env[name] = name;

    const result = EnvParser.parseString({ name });

    expect(result).toEqual(name);

    expect(typeof result).toEqual('string');
  });

  it('parses number', async () => {
    expect.assertions(2);

    const name = Generator.word();

    process.env[name] = '9';

    const result = EnvParser.parseNumber({ name });

    expect(result).toEqual(9);

    expect(typeof result).toEqual('number');
  });

  it('parses boolean', async () => {
    expect.assertions(2);

    const name = Generator.word();

    process.env[name] = 'true';

    const result = EnvParser.parseBoolean({ name });

    expect(result).toEqual(true);

    expect(typeof result).toEqual('boolean');
  });
});
