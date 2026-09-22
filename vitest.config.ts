import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: {
    alias: {
      '@milkui/core/primitive': fileURLToPath(new URL('./packages/core/src/primitive/index.ts', import.meta.url)),
      '@milkui/core/collapsible': fileURLToPath(new URL('./packages/core/src/collapsible/index.ts', import.meta.url)),
      '@milkui/core/button': fileURLToPath(new URL('./packages/core/src/button/index.ts', import.meta.url)),
      '@milkui/core/accordion': fileURLToPath(new URL('./packages/core/src/accordion/index.ts', import.meta.url)),
      '@milkui/react/primitive': fileURLToPath(new URL('./packages/react/src/primitive/index.ts', import.meta.url)),
      '@milkui/react/button': fileURLToPath(new URL('./packages/react/src/button/index.ts', import.meta.url)),
      '@milkui/react/accordion': fileURLToPath(new URL('./packages/react/src/accordion/index.ts', import.meta.url)),
      '@milkui/react/collapsible': fileURLToPath(new URL('./packages/react/src/collapsible/index.ts', import.meta.url)),
      '@milkui/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@milkui/react': fileURLToPath(new URL('./packages/react/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx', 'docs/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
