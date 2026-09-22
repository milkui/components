import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: {
    alias: {
      '@milkui/primitive': fileURLToPath(
        new URL('./packages/core/primitive/src/index.ts', import.meta.url),
      ),
      '@milkui/collapsible': fileURLToPath(
        new URL('./packages/core/collapsible/src/index.ts', import.meta.url),
      ),
      '@milkui/button': fileURLToPath(
        new URL('./packages/core/button/src/index.ts', import.meta.url),
      ),
      '@milkui/accordion': fileURLToPath(
        new URL('./packages/core/accordion/src/index.ts', import.meta.url),
      ),
      '@milkui/react/primitive': fileURLToPath(
        new URL('./packages/react/src/primitive/index.ts', import.meta.url),
      ),
      '@milkui/react/button': fileURLToPath(
        new URL('./packages/react/src/button/index.ts', import.meta.url),
      ),
      '@milkui/react/accordion': fileURLToPath(
        new URL('./packages/react/src/accordion/index.ts', import.meta.url),
      ),
      '@milkui/react/collapsible': fileURLToPath(
        new URL('./packages/react/src/collapsible/index.ts', import.meta.url),
      ),
      '@milkui/react': fileURLToPath(new URL('./packages/react/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx', 'examples/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
