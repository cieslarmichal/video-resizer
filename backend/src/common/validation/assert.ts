import { Validator } from './validator.js';
import { InputNotValidError } from '../errors/common/inputNotValidError.js';

export class Assert {
  public static isNotEmptyString(value: unknown): asserts value is string {
    if (!Validator.isNonEmptyString(value)) {
      throw new InputNotValidError({
        reason: `Input string is empty.`,
        value,
      });
    }
  }

  public static isNumber(value: unknown): asserts value is number {
    if (!Validator.isNumber(value)) {
      throw new InputNotValidError({
        reason: `Input is not a number.`,
        value,
      });
    }
  }

  public static isEnum<T extends Record<string, string>>(enumType: T, value: unknown): asserts value is T[keyof T] {
    if (!Validator.isEnum(enumType, value)) {
      throw new InputNotValidError({
        reason: `Input is not an enum value.`,
        value,
        enum: enumType,
      });
    }
  }
}
