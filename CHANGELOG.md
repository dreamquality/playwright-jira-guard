# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-08

### Added
- Initial release of playwright-jira-guard
- Pre-fetch & Cache strategy for optimal performance
- `globalSetup` function to fetch and cache open Jira issues
- `skipIfJiraOpen` function to skip tests based on cached Jira status
- Support for Jira API v3 authentication
- Configuration via environment variables or config object
- Graceful error handling - tests proceed normally if Jira is unavailable
- TypeScript support with full type definitions
- Comprehensive README with usage examples
- Example files demonstrating package usage
- Both CommonJS and ESM module support

### Features
- Zero runtime overhead - no HTTP requests during test execution
- Synchronous cache file lookup for instant test skipping
- Customizable JQL queries for flexible issue filtering
- Configurable cache file location
- Detailed console logging for debugging

[1.0.0]: https://github.com/dreamquality/playwright-jira-guard/releases/tag/v1.0.0
