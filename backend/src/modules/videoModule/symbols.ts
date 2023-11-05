export const symbols = {
  videoModuleConfig: Symbol('videoModuleConfig'),
  uploadResizedVideoCommandHandler: Symbol('uploadResizedVideoCommandHandler'),
  fileTransferService: Symbol('fileTransferService'),
  videoResizerService: Symbol('videoResizerService'),
  processExecutorService: Symbol('processExecutorService'),
};

export const videoSymbols = {
  uploadResizedVideoCommandHandler: symbols.uploadResizedVideoCommandHandler,
};
