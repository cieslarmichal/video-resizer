import { beforeEach, expect, describe, it } from 'vitest';

import { UrlHttpController } from './api/httpControllers/urlHttpController/urlHttpController.js';
import { urlSymbols } from './symbols.js';
import { Application } from '../../core/application.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('UrlModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<UrlHttpController>(urlSymbols.urlHttpController)).toBeInstanceOf(UrlHttpController);
  });
});
