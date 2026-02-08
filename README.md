# playwright-jira-guard

[![CI](https://github.com/dreamquality/playwright-jira-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamquality/playwright-jira-guard/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/playwright-jira-guard.svg)](https://www.npmjs.com/package/playwright-jira-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically skip Playwright tests if a linked Jira issue is still open. This package uses a **Pre-fetch & Cache** strategy to avoid making HTTP requests during individual test execution, ensuring optimal performance.

## Features

- 🚀 **Performance First**: No HTTP requests during test execution
- 📦 **Pre-fetch & Cache**: Fetches open Jira issues during global setup
- ⚡ **Zero Runtime Overhead**: Synchronous file-based cache lookup
- 🛡️ **Graceful Degradation**: Tests run normally if Jira is unavailable
- 🔧 **Flexible Configuration**: Environment variables or config object
- 📝 **TypeScript Support**: Fully typed with TypeScript definitions
- ✅ **Well Tested**: Comprehensive test suite with 100% coverage goal

## Installation

```bash
npm install playwright-jira-guard
```

## Prerequisites

- Node.js >= 18.0.0
- @playwright/test >= 1.20.0
- Jira API token (create one at https://id.atlassian.com/manage-profile/security/api-tokens)

## Configuration

### Step 1: Set Environment Variables

Create a `.env` file or export these variables:

```bash
JIRA_HOST=https://your-company.atlassian.net
JIRA_USER=your-email@company.com
JIRA_TOKEN=your-api-token-here
JIRA_JQL=status != Done AND status != Closed  # Optional: Custom JQL query
JIRA_CACHE_FILE=.jira-cache.json             # Optional: Custom cache file path
```

### Step 2: Configure Playwright Global Setup

Update your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';
import { globalSetup } from 'playwright-jira-guard';

export default defineConfig({
  // Add the global setup function
  globalSetup: globalSetup,
  
  // ... rest of your config
  testDir: './tests',
  workers: 4,
  // ...
});
```

**Alternative: Pass Configuration Programmatically**

If you prefer not to use environment variables:

```typescript
import { defineConfig } from '@playwright/test';
import { globalSetup } from 'playwright-jira-guard';

// Create a wrapper function to pass config
async function setup() {
  await globalSetup({
    host: 'https://your-company.atlassian.net',
    user: 'your-email@company.com',
    token: 'your-api-token',
    jql: 'status != Done AND status != Closed', // Optional
    cacheFile: '.jira-cache.json', // Optional
  });
}

export default defineConfig({
  globalSetup: setup,
  // ... rest of your config
});
```

## Usage

### Skip Tests with Open Jira Issues

In your test files, use the `skipIfJiraOpen` function:

```typescript
import { test, expect } from '@playwright/test';
import { skipIfJiraOpen } from 'playwright-jira-guard';

test('feature with known bug', async ({ page }) => {
  // Skip this test if QA-123 is still open
  skipIfJiraOpen('QA-123');
  
  await page.goto('https://example.com');
  // ... rest of your test
});

test('another test with issue', async ({ page }) => {
  skipIfJiraOpen('PROJ-456');
  
  // Test code here
});
```

### Custom Cache File Location

```typescript
skipIfJiraOpen('QA-123', '.custom-cache.json');
```

## How It Works

### Phase 1: Global Setup (Pre-fetch)
1. The `globalSetup` function runs **once** before all tests
2. It fetches all open Jira issues matching your JQL query
3. Issue keys are saved to `.jira-cache.json` (e.g., `['QA-123', 'PROJ-456']`)

### Phase 2: Test Runtime (Cache Lookup)
1. Each test calls `skipIfJiraOpen(ticketId)`
2. The function reads `.jira-cache.json` synchronously (no HTTP request)
3. If the ticket is in the cache, it calls `test.skip()`

## Advanced Configuration

### Custom JQL Query

By default, the package fetches issues with:
```
status != Done AND status != Closed
```

To customize the JQL query:

**Via Environment Variable:**
```bash
JIRA_JQL="project = MYPROJECT AND status = 'In Progress'"
```

**Via Config Object:**
```typescript
await globalSetup({
  host: 'https://your-company.atlassian.net',
  user: 'your-email@company.com',
  token: 'your-api-token',
  jql: "project = MYPROJECT AND status = 'In Progress'",
});
```

### Multiple Projects

To track issues across multiple projects:

```bash
JIRA_JQL="(project = QA OR project = DEV) AND status != Done"
```

## Error Handling

The package is designed to **never fail your test runs** due to Jira being unavailable:

- ✅ If Jira is down during global setup → Warning logged, tests run normally
- ✅ If cache file is missing → Warning logged, tests run normally
- ✅ If cache file is corrupted → Warning logged, tests run normally
- ✅ If no configuration provided → Warning logged, tests run normally

## API Reference

### `globalSetup(config?: Partial<JiraConfig>): Promise<void>`

Global setup function to fetch and cache open Jira issues.

**Parameters:**
- `config` (optional): Configuration object
  - `host`: Jira host URL
  - `user`: Jira username/email
  - `token`: Jira API token
  - `jql`: JQL query (default: `'status != Done AND status != Closed'`)
  - `cacheFile`: Cache file path (default: `'.jira-cache.json'`)

### `skipIfJiraOpen(ticketId: string, cacheFile?: string): void`

Skip a test if the Jira ticket is still open.

**Parameters:**
- `ticketId`: Jira ticket ID (e.g., `'QA-123'`)
- `cacheFile` (optional): Custom cache file path

## Cache File Format

The `.jira-cache.json` file has the following structure:

```json
{
  "openIssues": ["QA-123", "QA-456", "PROJ-789"],
  "lastUpdated": "2026-02-08T14:20:00.000Z"
}
```

## CI/CD Integration

Add `.jira-cache.json` to your `.gitignore`:

```gitignore
.jira-cache.json
```

Set environment variables in your CI/CD pipeline:
- GitHub Actions: Use repository secrets
- Jenkins: Use credentials binding
- GitLab CI: Use protected variables

## Troubleshooting

### Tests are not being skipped

1. Check that `.jira-cache.json` exists after running tests
2. Verify the cache contains your ticket ID
3. Ensure the ticket ID matches exactly (case-sensitive)
4. Check console logs for warnings from `[playwright-jira-guard]`

### Global setup is not running

1. Verify `globalSetup` is correctly configured in `playwright.config.ts`
2. Run tests with `DEBUG=pw:test` to see setup execution

### Jira authentication fails

1. Verify your API token is valid
2. Ensure you're using your email (not username) for `JIRA_USER`
3. Check the Jira host URL format: `https://your-company.atlassian.net`

## License

MIT

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/dreamquality/playwright-jira-guard.git
cd playwright-jira-guard

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build
```

### Running Tests

The project uses Vitest for testing:

```bash
# Run tests once
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Project Structure

```
playwright-jira-guard/
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── jira-api.ts        # Jira API integration
│   ├── global-setup.ts    # Playwright global setup
│   └── index.ts           # Main exports
├── tests/
│   ├── jira-api.test.ts           # Jira API tests
│   ├── global-setup.test.ts       # Global setup tests
│   ├── skip-if-jira-open.test.ts  # Skip function tests
│   └── integration.test.ts        # Integration tests
├── examples/              # Usage examples
└── .github/workflows/     # CI/CD workflows
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Reporting Issues

If you find a bug or have a feature request, please create an issue on GitHub with:
- A clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (Node.js version, OS, etc.)

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **CI Workflow**: Runs tests on Node.js 18.x, 20.x, and 22.x
- **Publish Workflow**: Automatically publishes to NPM on releases
- **Release Workflow**: Automates version bumping and changelog updates

## Support

For questions and support, please:
- Check the [documentation](https://github.com/dreamquality/playwright-jira-guard#readme)
- Search [existing issues](https://github.com/dreamquality/playwright-jira-guard/issues)
- Create a [new issue](https://github.com/dreamquality/playwright-jira-guard/issues/new) if needed