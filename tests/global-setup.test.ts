import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import globalSetup from '../src/global-setup';
import * as jiraApi from '../src/jira-api';

vi.mock('../src/jira-api');

describe('global-setup', () => {
  const testCacheFile = '.test-jira-cache.json';
  const testCachePath = resolve(process.cwd(), testCacheFile);

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up test cache file if it exists
    if (existsSync(testCachePath)) {
      unlinkSync(testCachePath);
    }
  });

  afterEach(() => {
    // Clean up test cache file
    if (existsSync(testCachePath)) {
      unlinkSync(testCachePath);
    }
    // Restore environment variables
    delete process.env.JIRA_HOST;
    delete process.env.JIRA_USER;
    delete process.env.JIRA_TOKEN;
    delete process.env.JIRA_JQL;
    delete process.env.JIRA_CACHE_FILE;
  });

  it('should fetch issues and create cache file successfully', async () => {
    const mockIssues = ['TEST-1', 'TEST-2', 'TEST-3'];
    vi.mocked(jiraApi.fetchOpenIssues).mockResolvedValue(mockIssues);

    await globalSetup({
      host: 'https://test.atlassian.net',
      user: 'test@example.com',
      token: 'test-token',
      cacheFile: testCacheFile,
    });

    expect(jiraApi.fetchOpenIssues).toHaveBeenCalledWith({
      host: 'https://test.atlassian.net',
      user: 'test@example.com',
      token: 'test-token',
      jql: 'status != Done AND status != Closed',
      cacheFile: testCacheFile,
    });

    expect(existsSync(testCachePath)).toBe(true);

    const cacheContent = JSON.parse(readFileSync(testCachePath, 'utf-8'));
    expect(cacheContent.openIssues).toEqual(mockIssues);
    expect(cacheContent.lastUpdated).toBeDefined();
  });

  it('should use environment variables when config not provided', async () => {
    process.env.JIRA_HOST = 'https://env.atlassian.net';
    process.env.JIRA_USER = 'env@example.com';
    process.env.JIRA_TOKEN = 'env-token';
    process.env.JIRA_CACHE_FILE = testCacheFile;

    const mockIssues = ['ENV-1'];
    vi.mocked(jiraApi.fetchOpenIssues).mockResolvedValue(mockIssues);

    await globalSetup();

    expect(jiraApi.fetchOpenIssues).toHaveBeenCalledWith({
      host: 'https://env.atlassian.net',
      user: 'env@example.com',
      token: 'env-token',
      jql: 'status != Done AND status != Closed',
      cacheFile: testCacheFile,
    });
  });

  it('should prefer config object over environment variables', async () => {
    process.env.JIRA_HOST = 'https://env.atlassian.net';
    process.env.JIRA_USER = 'env@example.com';
    process.env.JIRA_TOKEN = 'env-token';

    const mockIssues = ['CONFIG-1'];
    vi.mocked(jiraApi.fetchOpenIssues).mockResolvedValue(mockIssues);

    await globalSetup({
      host: 'https://config.atlassian.net',
      user: 'config@example.com',
      token: 'config-token',
      cacheFile: testCacheFile,
    });

    expect(jiraApi.fetchOpenIssues).toHaveBeenCalledWith({
      host: 'https://config.atlassian.net',
      user: 'config@example.com',
      token: 'config-token',
      jql: 'status != Done AND status != Closed',
      cacheFile: testCacheFile,
    });
  });

  it('should use custom JQL when provided', async () => {
    const customJql = 'project = TEST AND status = Open';
    const mockIssues = ['TEST-1'];
    vi.mocked(jiraApi.fetchOpenIssues).mockResolvedValue(mockIssues);

    await globalSetup({
      host: 'https://test.atlassian.net',
      user: 'test@example.com',
      token: 'test-token',
      jql: customJql,
      cacheFile: testCacheFile,
    });

    expect(jiraApi.fetchOpenIssues).toHaveBeenCalledWith({
      host: 'https://test.atlassian.net',
      user: 'test@example.com',
      token: 'test-token',
      jql: customJql,
      cacheFile: testCacheFile,
    });
  });

  it('should warn and skip when Jira configuration is missing', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await globalSetup();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[playwright-jira-guard] Jira configuration not found. Tests will run normally without skipping.'
    );
    expect(jiraApi.fetchOpenIssues).not.toHaveBeenCalled();
    expect(existsSync(testCachePath)).toBe(false);

    consoleWarnSpy.mockRestore();
  });

  it('should handle fetch errors gracefully without failing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(jiraApi.fetchOpenIssues).mockRejectedValue(
      new Error('Network error')
    );

    await expect(
      globalSetup({
        host: 'https://test.atlassian.net',
        user: 'test@example.com',
        token: 'test-token',
        cacheFile: testCacheFile,
      })
    ).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[playwright-jira-guard] Tests will run normally without skipping.'
    );
    expect(existsSync(testCachePath)).toBe(false);

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should use default cache file name when not specified', async () => {
    const defaultCachePath = resolve(process.cwd(), '.jira-cache.json');
    const mockIssues = ['TEST-1'];
    vi.mocked(jiraApi.fetchOpenIssues).mockResolvedValue(mockIssues);

    try {
      await globalSetup({
        host: 'https://test.atlassian.net',
        user: 'test@example.com',
        token: 'test-token',
      });

      expect(existsSync(defaultCachePath)).toBe(true);
    } finally {
      // Clean up default cache file
      if (existsSync(defaultCachePath)) {
        unlinkSync(defaultCachePath);
      }
    }
  });
});
