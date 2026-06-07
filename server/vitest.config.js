import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './src/__tests__/globalSetup.js',
    setupFiles: ['./src/__tests__/setup.js'],
    env: {
      DATABASE_URL: 'file:./prisma/test.db',
      JWT_SECRET: 'test-secret-32-chars-xxxxxxxxxxxxxxxxx',
      NODE_ENV: 'test',
    },
    testTimeout: 15000,
    fileParallelism: false,
  },
})
