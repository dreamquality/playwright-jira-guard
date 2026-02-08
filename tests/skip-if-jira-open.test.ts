import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';

// Mock @playwright/test module
vi.mock('@playwright/test', () => ({
  test: {
    skip: vi.fn(),
  },
}));

// Import after mocking
import { skipIfJiraOpen } from '../src/index';
import { test } from '@playwright/test';

describe('skipIfJiraOpen', () => {
  const testCacheFile = '.test-skip-cache.json';
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
  });

  it('should skip test when ticket is in cache', () => {
    const cache = {
      openIssues: ['TEST-1', 'TEST-2', 'TEST-3'],
      lastUpdated: new Date().toISOString(),
    };

    writeFileSync(testCachePath, JSON.stringify(cache), 'utf-8');

    skipIfJiraOpen('TEST-2', testCacheFile);

    expect(test.skip).toHaveBeenCalledWith(
      true,
      'Skipping test: Jira issue TEST-2 is still open'
    );
  });

  it('should not skip test when ticket is not in cache', () => {
    const cache = {
      openIssues: ['TEST-1', 'TEST-3'],
      lastUpdated: new Date().toISOString(),
    };

    writeFileSync(testCachePath, JSON.stringify(cache), 'utf-8');

    skipIfJiraOpen('TEST-2', testCacheFile);

    expect(test.skip).not.toHaveBeenCalled();
  });

  it('should handle missing cache file gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    skipIfJiraOpen('TEST-1', testCacheFile);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cache file not found')
    );
    expect(test.skip).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should handle corrupted cache file gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    writeFileSync(testCachePath, 'invalid json {', 'utf-8');

    skipIfJiraOpen('TEST-1', testCacheFile);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(test.skip).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should warn when no ticket ID provided', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    skipIfJiraOpen('', testCacheFile);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[playwright-jira-guard] No ticket ID provided to skipIfJiraOpen'
    );
    expect(test.skip).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should use default cache file when not specified', () => {
    const defaultCachePath = resolve(process.cwd(), '.jira-cache.json');
    const cache = {
      openIssues: ['DEFAULT-1'],
      lastUpdated: new Date().toISOString(),
    };

    try {
      writeFileSync(defaultCachePath, JSON.stringify(cache), 'utf-8');

      skipIfJiraOpen('DEFAULT-1');

      expect(test.skip).toHaveBeenCalledWith(
        true,
        'Skipping test: Jira issue DEFAULT-1 is still open'
      );
    } finally {
      if (existsSync(defaultCachePath)) {
        unlinkSync(defaultCachePath);
      }
    }
  });

  it('should handle cache with empty openIssues array', () => {
    const cache = {
      openIssues: [],
      lastUpdated: new Date().toISOString(),
    };

    writeFileSync(testCachePath, JSON.stringify(cache), 'utf-8');

    skipIfJiraOpen('TEST-1', testCacheFile);

    expect(test.skip).not.toHaveBeenCalled();
  });

  it('should be case-sensitive when matching ticket IDs', () => {
    const cache = {
      openIssues: ['TEST-1', 'test-2'],
      lastUpdated: new Date().toISOString(),
    };

    writeFileSync(testCachePath, JSON.stringify(cache), 'utf-8');

    skipIfJiraOpen('test-1', testCacheFile);
    expect(test.skip).not.toHaveBeenCalled();

    skipIfJiraOpen('test-2', testCacheFile);
    expect(test.skip).toHaveBeenCalledTimes(1);
  });
});
