import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@trading-app/core': resolve(__dirname, 'packages/core/src/index.ts'),
      '@trading-app/datafeed': resolve(__dirname, 'packages/datafeed/src/index.ts'),
      '@trading-app/ui': resolve(__dirname, 'packages/ui/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts'],
    tsconfig: './tsconfig.json',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/index.ts'],
    },
  },
});
