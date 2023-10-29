import { EnvParser } from '../libs/envParser/envParser.js';
import { LoggerLevel } from '../libs/logger/types/loggerLevel.js';

export class ConfigProvider {
  private static getStringEnvVariable(envVariableName: string): string {
    const value = EnvParser.parseString({ name: envVariableName });

    Assert.isNotEmptyString(value);

    return value;
  }

  private static getEnumEnvVariable<T extends Record<string, string>>(
    enumType: T,
    envVariableName: string,
  ): T[keyof T] {
    const value = EnvParser.parseString({ name: envVariableName });

    Assert.isEnum(enumType, value);

    return value as T[keyof T];
  }

  public static getLoggerLevel(): LoggerLevel {
    return this.getEnumEnvVariable(LoggerLevel, 'LOGGER_LEVEL');
  }

  public static getMongoDatabaseUri(): string {
    return this.getStringEnvVariable('MONGO_DATABASE_URI');
  }

  public static getDomainUrl(): string {
    return this.getStringEnvVariable('DOMAIN_URL');
  }

  public static getKafkaBroker(): string {
    return this.getStringEnvVariable('KAFKA_BROKER');
  }

  public static getKafkaClientId(): string {
    return 'url-shortener-app';
  }
}
