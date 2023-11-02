import { Video360pQueueController } from './api/queueHandlers/video360pQueueController/video360pQueueController.js';
import { Video480pQueueController } from './api/queueHandlers/video480pQueueController/video480pQueueController.js';
import { Video720pQueueController } from './api/queueHandlers/video720pQueueHandler/video720pQueueController.js';
import { type UploadResizedVideoCommandHandler } from './application/commandHandlers/uploadResizedVideoCommandHandler/uploadResizedVideoCommandHandler.js';
import { UploadResizedVideoCommandHandlerImpl } from './application/commandHandlers/uploadResizedVideoCommandHandler/uploadResizedVideoCommandHandlerImpl.js';
import { type FileTransferService } from './application/services/fileTransferService/fileTransferService.js';
import { type VideoResizerService } from './application/services/videoResizerService/videoResizerService.js';
import { VideoResizerServiceImpl } from './application/services/videoResizerService/videoResizerServiceImpl.js';
import { FileTransferServiceImpl } from './infrastructure/services/fileTransferService/fileTransferServiceImpl.js';
import { symbols } from './symbols.js';
import { type VideoModuleConfig } from './videoModuleConfig.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type S3Service } from '../../libs/s3/services/s3Service/s3Service.js';

export class VideoModule implements DependencyInjectionModule {
  public constructor(private readonly config: VideoModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<VideoModuleConfig>(symbols.videoModuleConfig, this.config);

    container.bind<FileTransferService>(
      symbols.fileTransferService,
      () => new FileTransferServiceImpl(container.get<S3Service>(coreSymbols.s3Service)),
    );

    container.bind<VideoResizerService>(symbols.videoResizerService, () => new VideoResizerServiceImpl());

    container.bind<UploadResizedVideoCommandHandler>(
      symbols.uploadResizedVideoCommandHandler,
      () =>
        new UploadResizedVideoCommandHandlerImpl(
          container.get<FileTransferService>(symbols.fileTransferService),
          container.get<VideoResizerService>(symbols.videoResizerService),
          container.get<VideoModuleConfig>(symbols.videoModuleConfig),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<Video360pQueueController>(
      symbols.video360pQueueController,
      () =>
        new Video360pQueueController(
          container.get<UploadResizedVideoCommandHandler>(symbols.uploadResizedVideoCommandHandler),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<Video480pQueueController>(
      symbols.video480pQueueController,
      () =>
        new Video480pQueueController(
          container.get<UploadResizedVideoCommandHandler>(symbols.uploadResizedVideoCommandHandler),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<Video720pQueueController>(
      symbols.video720pQueueController,
      () =>
        new Video720pQueueController(
          container.get<UploadResizedVideoCommandHandler>(symbols.uploadResizedVideoCommandHandler),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );
  }
}
