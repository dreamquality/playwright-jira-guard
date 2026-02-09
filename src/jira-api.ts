import type { JiraConfig, JiraSearchResponse } from './types.js';

/**
 * Fetches open issues from Jira using JQL query
 */
export async function fetchOpenIssues(config: JiraConfig): Promise<string[]> {
  const { host, user, token, jql = 'status != Done AND status != Closed' } = config;
  
  // Validate required config
  if (!host || !user || !token) {
    throw new Error('Missing required Jira configuration: host, user, and token must be provided');
  }

  const openIssues: string[] = [];
  let startAt = 0;
  const maxResults = 100;
  let hasMore = true;

  const auth = Buffer.from(`${user}:${token}`).toString('base64');
  
  try {
    while (hasMore) {
      const url = new URL(`${host}/rest/api/3/search`);
      url.searchParams.set('jql', jql);
      url.searchParams.set('startAt', startAt.toString());
      url.searchParams.set('maxResults', maxResults.toString());
      url.searchParams.set('fields', 'key,status,summary');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Jira API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: JiraSearchResponse = await response.json();
      
      // Extract issue keys
      openIssues.push(...data.issues.map(issue => issue.key));

      // Check if there are more results
      startAt += maxResults;
      hasMore = startAt < data.total;
    }

    return openIssues;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Jira issues: ${error.message}`);
    }
    throw error;
  }
}
