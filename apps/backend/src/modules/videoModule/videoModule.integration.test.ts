import { beforeEach, expect, describe, it } from 'vitest';

import { Video360pQueueController } from './api/queueHandlers/video360pQueueController/video360pQueueController.js';
import { Video480pQueueController } from './api/queueHandlers/video480pQueueController/video480pQueueController.js';
import { Video720pQueueController } from './api/queueHandlers/video720pQueueHandler/video720pQueueController.js';
import { videoSymbols } from './symbols.js';
import { Application } from '../../core/application.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('VideoModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<Video360pQueueController>(videoSymbols.video360pQueueController)).toBeInstanceOf(
      Video360pQueueController,
    );

    expect(container.get<Video480pQueueController>(videoSymbols.video480pQueueController)).toBeInstanceOf(
      Video480pQueueController,
    );

    expect(container.get<Video720pQueueController>(videoSymbols.video720pQueueController)).toBeInstanceOf(
      Video720pQueueController,
    );
  });
});
