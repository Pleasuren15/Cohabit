import path from 'node:path';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname = import.meta.dirname;

// More info at: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
  // Pin storybook/test and its CJS-only deps so the Vite 8 (Rolldown) dep
  // optimizer pre-bundles them for Vitest browser mode. Without this, npm's
  // hoisted node_modules layout fails every story test at import time with:
  //   aria-query does not provide an export named 'elementRoles'
  optimizeDeps: {
    include: [
      'storybook/test',
      '@testing-library/dom',
      'aria-query',
      'lz-string',
      'pretty-format',
    ],
  },
});
