import { test, expect } from '@playwright/test';
import { skipIfJiraOpen } from 'playwright-jira-guard';

/**
 * Example test demonstrating playwright-jira-guard usage
 */

test.describe('Feature with known issues', () => {
  test('test with open Jira bug', async ({ page }) => {
    // This test will be skipped if QA-123 is still open in Jira
    skipIfJiraOpen('QA-123');
    
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('test with resolved issue', async ({ page }) => {
    // This test will run if QA-456 is closed/resolved
    skipIfJiraOpen('QA-456');
    
    await page.goto('https://example.com');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('normal test without Jira ticket', async ({ page }) => {
    // This test always runs (no Jira ticket associated)
    await page.goto('https://example.com');
    await expect(page).toHaveURL('https://example.com/');
  });
});

test.describe('Multiple issues tracking', () => {
  test('feature blocked by multiple issues', async ({ page }) => {
    // You can call skipIfJiraOpen multiple times to track multiple blockers
    skipIfJiraOpen('QA-789');
    skipIfJiraOpen('PROJ-101');
    
    // If either issue is open, the test will be skipped
    await page.goto('https://example.com');
    // ... test code
  });
});
