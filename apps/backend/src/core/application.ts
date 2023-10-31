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

    const s3ResizedVideosBucket = ConfigProvider.getS3ResizedVideosBucket();

    const awsRegion = ConfigProvider.getAwsRegion();

    const modules: DependencyInjectionModule[] = [new VideoModule({ s3ResizedVideosBucket })];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () => LoggerServiceFactory.create({ loggerLevel }));

    container.bind<S3Service>(symbols.s3Service, () => S3ServiceFactory.create({ region: awsRegion }));

    return container;
  }
}
