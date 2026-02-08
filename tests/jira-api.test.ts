import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOpenIssues } from '../src/jira-api';
import type { JiraConfig } from '../src/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('jira-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchOpenIssues', () => {
    const mockConfig: JiraConfig = {
      host: 'https://test.atlassian.net',
      user: 'test@example.com',
      token: 'test-token',
      jql: 'status != Done',
    };

    it('should fetch issues successfully with single page', async () => {
      const mockResponse = {
        issues: [
          { key: 'TEST-1', fields: { status: { name: 'Open' }, summary: 'Issue 1' } },
          { key: 'TEST-2', fields: { status: { name: 'In Progress' }, summary: 'Issue 2' } },
        ],
        total: 2,
        startAt: 0,
        maxResults: 100,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchOpenIssues(mockConfig);

      expect(result).toEqual(['TEST-1', 'TEST-2']);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination correctly', async () => {
      const mockResponse1 = {
        issues: Array.from({ length: 100 }, (_, i) => ({
          key: `TEST-${i + 1}`,
          fields: { status: { name: 'Open' }, summary: `Issue ${i + 1}` },
        })),
        total: 150,
        startAt: 0,
        maxResults: 100,
      };

      const mockResponse2 = {
        issues: Array.from({ length: 50 }, (_, i) => ({
          key: `TEST-${i + 101}`,
          fields: { status: { name: 'Open' }, summary: `Issue ${i + 101}` },
        })),
        total: 150,
        startAt: 100,
        maxResults: 100,
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        });

      const result = await fetchOpenIssues(mockConfig);

      expect(result).toHaveLength(150);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result[0]).toBe('TEST-1');
      expect(result[149]).toBe('TEST-150');
    });

    it('should throw error when host is missing', async () => {
      const invalidConfig = { ...mockConfig, host: '' };

      await expect(fetchOpenIssues(invalidConfig)).rejects.toThrow(
        'Missing required Jira configuration: host, user, and token must be provided'
      );
    });

    it('should throw error when user is missing', async () => {
      const invalidConfig = { ...mockConfig, user: '' };

      await expect(fetchOpenIssues(invalidConfig)).rejects.toThrow(
        'Missing required Jira configuration: host, user, and token must be provided'
      );
    });

    it('should throw error when token is missing', async () => {
      const invalidConfig = { ...mockConfig, token: '' };

      await expect(fetchOpenIssues(invalidConfig)).rejects.toThrow(
        'Missing required Jira configuration: host, user, and token must be provided'
      );
    });

    it('should throw error when API request fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(fetchOpenIssues(mockConfig)).rejects.toThrow(
        'Failed to fetch Jira issues: Jira API request failed: 401 Unauthorized'
      );
    });

    it('should use default JQL when not provided', async () => {
      const configWithoutJql = {
        host: 'https://test.atlassian.net',
        user: 'test@example.com',
        token: 'test-token',
      };

      const mockResponse = {
        issues: [],
        total: 0,
        startAt: 0,
        maxResults: 100,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchOpenIssues(configWithoutJql);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('jql=status+%21%3D+Done+AND+status+%21%3D+Closed');
    });

    it('should include correct authentication header', async () => {
      const mockResponse = {
        issues: [],
        total: 0,
        startAt: 0,
        maxResults: 100,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchOpenIssues(mockConfig);

      const callHeaders = (global.fetch as any).mock.calls[0][1].headers;
      const expectedAuth = Buffer.from(`${mockConfig.user}:${mockConfig.token}`).toString('base64');
      
      expect(callHeaders.Authorization).toBe(`Basic ${expectedAuth}`);
      expect(callHeaders.Accept).toBe('application/json');
    });
  });
});
