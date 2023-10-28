interface ParseBooleanPayload {
  name: string;
}

export interface ParseStringPayload {
  name: string;
}

export interface ParseNumberPayload {
  name: string;
}

export interface ParseJsonPayload {
  name: string;
}

export class EnvParser {
  public static parseString(payload: ParseStringPayload): string | undefined {
    const { name } = payload;

    const value = process.env[name];

    if (value === undefined) {
      return undefined;
    }

    return String(value);
  }

  public static parseNumber(payload: ParseNumberPayload): number | undefined {
    const { name } = payload;

    const value = process.env[name];

    if (value === undefined) {
      return undefined;
    }

    return Number(value);
  }

  public static parseBoolean(payload: ParseBooleanPayload): boolean | undefined {
    const { name } = payload;

    const value = process.env[name];

    if (value === undefined) {
      return undefined;
    }

    return value === 'true';
  }
}
