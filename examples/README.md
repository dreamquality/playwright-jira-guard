# Example Usage

This directory contains example files demonstrating how to use `playwright-jira-guard`.

## Files

- **playwright.config.ts**: Example Playwright configuration with globalSetup
- **example.spec.ts**: Example test file showing different usage patterns
- **.env.example**: Example environment variables file

## Running the Examples

1. Install dependencies:
```bash
npm install playwright-jira-guard @playwright/test
```

2. Copy `.env.example` to `.env` and fill in your Jira credentials:
```bash
cp .env.example .env
```

3. Edit `.env` with your Jira information:
```bash
JIRA_HOST=https://your-company.atlassian.net
JIRA_USER=your-email@company.com
JIRA_TOKEN=your-api-token
```

4. Run the tests:
```bash
npx playwright test
```

## What Happens

1. **Global Setup Phase**: Before tests run, `playwright-jira-guard` will:
   - Connect to your Jira instance
   - Fetch all open issues matching the JQL query
   - Save the list of open issue keys to `.jira-cache.json`

2. **Test Execution Phase**: During each test:
   - `skipIfJiraOpen()` reads the cache file
   - If the ticket is in the cache, the test is skipped
   - Otherwise, the test runs normally

## Customizing JQL Query

To customize which issues are tracked, set the `JIRA_JQL` environment variable:

```bash
JIRA_JQL="project = MYPROJECT AND status IN ('Open', 'In Progress', 'Blocked')"
```
