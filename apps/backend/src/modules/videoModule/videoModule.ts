import { type CreateUrlRecordCommandHandler } from './application/commandHandlers/resizeVideoCommandHandler/resizeVideoCommandHandler.js';
import { CreateUrlRecordCommandHandlerImpl } from './application/commandHandlers/resizeVideoCommandHandler/resizeVideoCommandHandlerImpl.js';
import { symbols } from './symbols.js';
import { type VideoModuleConfig } from './videoModuleConfig.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';

export class VideoModule implements DependencyInjectionModule {
  public constructor(private readonly config: VideoModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<VideoModuleConfig>(symbols.videoModuleConfig, this.config);

    container.bind<CreateUrlRecordCommandHandler>(
      symbols.resizeVideoCommandHandler,
      () => new CreateUrlRecordCommandHandlerImpl(container.get<EncoderService>(symbols.encoderService)),
    );

    container.bind<UrlHttpController>(
      symbols.urlHttpController,
      () =>
        new UrlHttpController(
          container.get<CreateUrlRecordCommandHandler>(symbols.createUrlRecordCommandHandler),
          container.get<FindLongUrlQueryHandler>(symbols.findLongUrlQueryHandler),
          container.get<UrlModuleConfig>(symbols.urlModuleConfig),
        ),
    );
  }
}
