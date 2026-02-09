/**
 * Configuration options for Jira integration
 */
export interface JiraConfig {
  /**
   * Jira host URL (e.g., 'https://your-company.atlassian.net')
   */
  host: string;
  
  /**
   * Jira username/email
   */
  user: string;
  
  /**
   * Jira API token
   */
  token: string;
  
  /**
   * JQL query to fetch open issues (default: 'status != Done AND status != Closed')
   */
  jql?: string;
  
  /**
   * Path to cache file (default: '.jira-cache.json')
   */
  cacheFile?: string;
}

/**
 * Jira issue response from API
 */
export interface JiraIssue {
  key: string;
  fields: {
    status: {
      name: string;
    };
    summary: string;
  };
}

/**
 * Jira API search response
 */
export interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  startAt: number;
  maxResults: number;
}

/**
 * Cached Jira data structure
 */
export interface JiraCache {
  openIssues: string[];
  lastUpdated: string;
}
