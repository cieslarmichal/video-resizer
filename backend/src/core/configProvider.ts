import { AwsRegion } from '../common/types/awsRegion.js';
import { VideoResolution } from '../common/types/videoResolution.js';
import { Assert } from '../common/validation/assert.js';
import { Validator } from '../common/validation/validator.js';
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
    const value = EnvParser.parseString({ name: 'LOGGER_LEVEL' });

    if (value && Validator.isEnum(LoggerLevel, value)) {
      return value;
    }

    return LoggerLevel.debug;
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

  public static getLoggerPrettyLogs(): boolean {
    const value = EnvParser.parseBoolean({ name: 'LOGGER_PRETTY_LOGS' });

    if (value === undefined) {
      return false;
    }

    return value;
  }

  public static getTargetResolution(): VideoResolution {
    return this.getEnumEnvVariable(VideoResolution, 'TARGET_RESOLUTION');
  }
}
