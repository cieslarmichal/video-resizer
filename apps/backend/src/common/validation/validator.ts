/* eslint-disable @typescript-eslint/no-explicit-any */

export class Validator {
  public static isInteger(value: unknown): value is number {
    if (!Validator.isNumber(value)) {
      return false;
    }

    return Number.isInteger(value);
  }

  public static isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  public static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  public static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  public static isNonEmptyString(value: unknown): boolean {
    if (!Validator.isString(value)) {
      return false;
    }

    return value.length >= 1;
  }

  public static isEnum<T extends Record<string, string>>(enumObject: T, value: any): value is T[keyof T] {
    return Object.values(enumObject).includes(value);
  }
}
