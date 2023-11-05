import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import config from '../vitest.config';

export default mergeConfig(config, defineConfig());
