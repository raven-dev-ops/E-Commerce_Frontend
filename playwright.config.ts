import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'test-google-client-id',
      NEXT_PUBLIC_STRIPE_PUBLIC_KEY: 'pk_test_placeholder',
    },
  },
});
