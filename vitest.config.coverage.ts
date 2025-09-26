import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['lib/**/*.{js,ts}', 'app/**/*.{js,ts,tsx}'],
      exclude: ['node_modules/**', 'dist/**', 'build/**', 'out/**', 'coverage/**', '**/*.d.ts', '**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
      thresholds: {
        global: { statements: 90, branches: 85, functions: 90, lines: 90 },
        'lib/': { statements: 95, branches: 90, functions: 95, lines: 95 },
        'app/api/': { statements: 90, branches: 85, functions: 90, lines: 90 }
      }
    },
    include: ['test/**/*.{test,spec}.{js,ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000,
    retry: 2,
    reporters: ['verbose', 'json', 'html']
  }
})