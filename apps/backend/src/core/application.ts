import { ConfigProvider } from './configProvider.js';
import { symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { VideoModule } from '../modules/videoModule/videoModule.js';

export class Application {
  public static createContainer(): DependencyInjectionContainer {
    const domainUrl = ConfigProvider.getDomainUrl();

    const loggerLevel = ConfigProvider.getLoggerLevel();

    const kafkaBroker = ConfigProvider.getKafkaBroker();

    const kafkaClientId = ConfigProvider.getKafkaClientId();

    const modules: DependencyInjectionModule[] = [
      new VideoModule({
        domainUrl,
      }),
    ];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () => LoggerServiceFactory.create({ loggerLevel }));

    container.bind<UuidService>(symbols.uuidService, () => new UuidServiceImpl());

    container.bind<KafkaProducerService>(symbols.kafkaProducerService, () =>
      KafkaProducerServiceFactory.create({
        broker: kafkaBroker,
        clientId: kafkaClientId,
      }),
    );

    return container;
  }
}
