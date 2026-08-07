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
          // GitHub Actions runners cannot launch the Chromium sandbox (no
          // unprivileged user namespaces), so disable it on CI. --disable-dev-shm-usage
          // avoids shared-memory exhaustion on constrained runners.
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(
              process.env.CI
                ? {
                    launchOptions: {
                      args: ['--no-sandbox', '--disable-dev-shm-usage'],
                    },
                  }
                : {},
            ),
            instances: [{ browser: 'chromium' }],
          },
          // Retry file-import/runner races seen in CI (vitest-dev/vitest#9509,
          // #9635). Keeps the run green when a module import flakily fails.
          retry: process.env.CI ? 2 : 0,
          testTimeout: process.env.CI ? 30_000 : 10_000,
          hookTimeout: process.env.CI ? 30_000 : 10_000,
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
