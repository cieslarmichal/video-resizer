import { beforeEach, expect, describe, it } from 'vitest';

import { type UploadResizedVideoCommandHandler } from './application/commandHandlers/uploadResizedVideoCommandHandler/uploadResizedVideoCommandHandler.js';
import { UploadResizedVideoCommandHandlerImpl } from './application/commandHandlers/uploadResizedVideoCommandHandler/uploadResizedVideoCommandHandlerImpl.js';
import { videoSymbols } from './symbols.js';
import { Application } from '../../core/application.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('VideoModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(
      container.get<UploadResizedVideoCommandHandler>(videoSymbols.uploadResizedVideoCommandHandler),
    ).toBeInstanceOf(UploadResizedVideoCommandHandlerImpl);
  });
});
