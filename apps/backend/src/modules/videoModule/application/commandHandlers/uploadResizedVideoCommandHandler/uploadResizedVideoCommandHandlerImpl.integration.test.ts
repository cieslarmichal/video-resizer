import { beforeEach, expect, describe, it } from 'vitest';

import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('UploadResizedVideoCommandHandlerImpl', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {});
});
