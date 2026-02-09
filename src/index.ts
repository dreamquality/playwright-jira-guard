import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { test } from '@playwright/test';
import type { JiraCache } from './types.js';

/**
 * Loads the Jira cache from disk
 */
function loadCache(cacheFile = '.jira-cache.json'): string[] {
  const cachePath = resolve(process.cwd(), cacheFile);
  
  if (!existsSync(cachePath)) {
    console.warn(
      `[playwright-jira-guard] Cache file not found: ${cacheFile}. Tests will run normally.`
    );
    return [];
  }

  try {
    const content = readFileSync(cachePath, 'utf-8');
    const cache: JiraCache = JSON.parse(content);
    return cache.openIssues || [];
  } catch (error) {
    console.error('[playwright-jira-guard] Failed to read cache file:', error);
    return [];
  }
}

/**
 * Skip a Playwright test if the associated Jira ticket is still open
 * 
 * @param ticketId - The Jira ticket ID (e.g., 'QA-123', 'PROJ-456')
 * @param cacheFile - Optional path to cache file (default: '.jira-cache.json')
 * 
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { skipIfJiraOpen } from 'playwright-jira-guard';
 * 
 * test('my test with known issue', async ({ page }) => {
 *   skipIfJiraOpen('QA-123');
 *   // Test code here
 * });
 * ```
 */
export function skipIfJiraOpen(ticketId: string, cacheFile?: string): void {
  if (!ticketId) {
    console.warn('[playwright-jira-guard] No ticket ID provided to skipIfJiraOpen');
    return;
  }

  const openIssues = loadCache(cacheFile);
  
  if (openIssues.includes(ticketId)) {
    test.skip(true, `Skipping test: Jira issue ${ticketId} is still open`);
  }
}

// Re-export types for consumers
export type { JiraConfig, JiraCache } from './types.js';

// Export global setup function
export { default as globalSetup } from './global-setup.js';
