import { ConfigProvider } from './configProvider.js';
import { symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { S3ServiceFactory } from '../libs/s3/factories/s3ServiceFactory/s3ServiceFactory.js';
import { type S3Service } from '../libs/s3/services/s3Service/s3Service.js';
import { VideoModule } from '../modules/videoModule/videoModule.js';

export class Application {
  public static createContainer(): DependencyInjectionContainer {
    const loggerLevel = ConfigProvider.getLoggerLevel();

    const loggerPrettyLogs = ConfigProvider.getLoggerPrettyLogs();

    const s3ResizedVideosBucket = ConfigProvider.getS3ResizedVideosBucket();

    const awsEndpoint = ConfigProvider.getAwsEndpoint();

    const awsRegion = ConfigProvider.getAwsRegion();

    const ffmpegPath = ConfigProvider.getFfmpegPath();

    const modules: DependencyInjectionModule[] = [
      new VideoModule({
        s3ResizedVideosBucket,
        ffmpegPath,
      }),
    ];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({
        loggerLevel,
        prettyLogs: loggerPrettyLogs,
      }),
    );

    container.bind<S3Service>(symbols.s3Service, () =>
      S3ServiceFactory.create({
        region: awsRegion,
        endpoint: awsEndpoint,
      }),
    );

    return container;
  }
}
