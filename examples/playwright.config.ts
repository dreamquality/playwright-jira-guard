import { defineConfig } from '@playwright/test';
import { globalSetup } from 'playwright-jira-guard';

/**
 * Example Playwright configuration with playwright-jira-guard integration
 * 
 * This configuration shows how to integrate playwright-jira-guard into your project.
 * The globalSetup function will run before all tests and fetch open Jira issues.
 */
export default defineConfig({
  // Register the global setup to fetch and cache Jira issues
  globalSetup: globalSetup,
  
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: 'html',
  
  use: {
    trace: 'on-first-retry',
  },
});
