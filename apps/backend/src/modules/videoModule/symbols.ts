export const symbols = {
  videoModuleConfig: Symbol('videoModuleConfig'),
  uploadResizedVideoCommandHandler: Symbol('uploadResizedVideoCommandHandler'),
  fileTransferService: Symbol('fileTransferService'),
  videoResizerService: Symbol('videoResizerService'),
  video360pQueueController: Symbol('video360pQueueController'),
  video480pQueueController: Symbol('video480pQueueController'),
  video720pQueueController: Symbol('video720pQueueController'),
};

export const videoSymbols = {
  video360pQueueController: symbols.video360pQueueController,
  video480pQueueController: symbols.video480pQueueController,
  video720pQueueController: symbols.video720pQueueController,
};
