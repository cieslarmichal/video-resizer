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

  public static getS3ResizedVideosBucket(): string {
    return this.getStringEnvVariable('S3_RESIZED_VIDEOS_BUCKET');
  }

  public static getAwsEndpoint(): string | undefined {
    return EnvParser.parseString({ name: 'AWS_ENDPOINT' });
  }

  public static getAwsRegion(): AwsRegion {
    return this.getEnumEnvVariable(AwsRegion, 'AWS_REGION');
  }

  public static getFfmpegPath(): string {
    return this.getStringEnvVariable('FFMPEG_PATH');
  }

  public static getFfprobePath(): string {
    return this.getStringEnvVariable('FFPROBE_PATH');
  }
}
