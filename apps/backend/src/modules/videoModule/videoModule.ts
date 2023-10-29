import { type UploadResizedVideoCommandHandler } from './application/commandHandlers/uploadResizedVideoCommandHandler/updoadResizedVideoCommandHandler.js';
import { UploadResizedVideoCommandHandlerImpl } from './application/commandHandlers/uploadResizedVideoCommandHandler/uploadResizedVideoCommandHandlerImpl.js';
import { symbols } from './symbols.js';
import { type VideoModuleConfig } from './videoModuleConfig.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';

export class VideoModule implements DependencyInjectionModule {
  public constructor(private readonly config: VideoModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<VideoModuleConfig>(symbols.videoModuleConfig, this.config);

    container.bind<UploadResizedVideoCommandHandler>(
      symbols.uploadResizedVideoCommandHandler,
      () => new UploadResizedVideoCommandHandlerImpl(container.get<EncoderService>(symbols.encoderService)),
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
