// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'https://tedliu123456-arch.github.io/camping-app/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
});
