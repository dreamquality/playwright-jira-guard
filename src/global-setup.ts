import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { JiraConfig, JiraCache } from './types.js';
import { fetchOpenIssues } from './jira-api.js';

/**
 * Global setup function for Playwright
 * Fetches open Jira issues and caches them to a file
 */
export default async function globalSetup(config?: Partial<JiraConfig>): Promise<void> {
  // Build configuration from environment variables and config object
  const jiraConfig: JiraConfig = {
    host: config?.host || process.env.JIRA_HOST || '',
    user: config?.user || process.env.JIRA_USER || '',
    token: config?.token || process.env.JIRA_TOKEN || '',
    jql: config?.jql || process.env.JIRA_JQL || 'status != Done AND status != Closed',
    cacheFile: config?.cacheFile || process.env.JIRA_CACHE_FILE || '.jira-cache.json',
  };

  // If Jira is not configured, skip caching but don't fail
  if (!jiraConfig.host || !jiraConfig.user || !jiraConfig.token) {
    console.warn(
      '[playwright-jira-guard] Jira configuration not found. Tests will run normally without skipping.'
    );
    console.warn(
      '[playwright-jira-guard] To enable Jira integration, set JIRA_HOST, JIRA_USER, and JIRA_TOKEN environment variables.'
    );
    return;
  }

  try {
    console.log('[playwright-jira-guard] Fetching open Jira issues...');
    const openIssues = await fetchOpenIssues(jiraConfig);

    const cache: JiraCache = {
      openIssues,
      lastUpdated: new Date().toISOString(),
    };

    const cacheFileName = jiraConfig.cacheFile || '.jira-cache.json';
    const cachePath = resolve(process.cwd(), cacheFileName);
    writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');

    console.log(
      `[playwright-jira-guard] Successfully cached ${openIssues.length} open issues to ${cacheFileName}`
    );
  } catch (error) {
    // Don't fail the test run if Jira is down
    console.error('[playwright-jira-guard] Failed to fetch Jira issues:', error);
    console.warn('[playwright-jira-guard] Tests will run normally without skipping.');
  }
}
