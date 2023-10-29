import { AwsRegion } from '../common/types/awsRegion.js';
import { Assert } from '../common/validation/assert.js';
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

  public static getS3ResizedVideosBucketName(): string {
    return this.getStringEnvVariable('S3_RESIZED_VIDEOS_BUCKET_NAME');
  }

  public static getAwsRegion(): AwsRegion {
    return this.getEnumEnvVariable(AwsRegion, 'AWS_REGION');
  }
}
