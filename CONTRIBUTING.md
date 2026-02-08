# Contributing to playwright-jira-guard

Thank you for your interest in contributing to playwright-jira-guard! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to see if the problem has already been reported
2. Update to the latest version to see if the issue persists

When creating a bug report, include:
- A clear, descriptive title
- Detailed steps to reproduce the issue
- Expected behavior vs actual behavior
- Code samples or test cases
- Your environment (Node.js version, OS, package version)
- Any error messages or logs

### Suggesting Features

Feature requests are welcome! When suggesting a feature:
1. Check if it has already been suggested
2. Provide a clear use case
3. Explain why this feature would be useful to most users
4. Consider if it fits the project's scope and goals

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/playwright-jira-guard.git
   cd playwright-jira-guard
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Update documentation as needed

5. **Add tests**
   - Write tests for new functionality
   - Ensure existing tests still pass
   - Aim for good test coverage
   ```bash
   npm test
   ```

6. **Build and verify**
   ```bash
   npm run build
   ```

7. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format when possible
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue with X"
   git commit -m "docs: update README"
   ```

8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Explain the motivation behind the changes

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Getting Started

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build
```

## Testing

We use Vitest for testing. All new features should include tests.

### Test Structure

```
tests/
├── jira-api.test.ts           # Tests for Jira API integration
├── global-setup.test.ts       # Tests for global setup function
├── skip-if-jira-open.test.ts  # Tests for skip function
└── integration.test.ts        # Integration tests
```

### Writing Tests

- Test files should end with `.test.ts`
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies (like fetch)
- Clean up any files created during tests

Example:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('myFunction', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should handle valid input correctly', () => {
    // Test implementation
    expect(result).toBe(expected);
  });

  it('should throw error for invalid input', () => {
    expect(() => myFunction(invalid)).toThrow('Error message');
  });
});
```

## Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Use async/await for asynchronous code

## Documentation

When adding new features or making changes:
- Update README.md if user-facing changes
- Update inline code comments
- Update CHANGELOG.md
- Update TypeScript type definitions

## Release Process

Releases are handled by maintainers:
1. Version is bumped using the release workflow
2. CHANGELOG.md is updated
3. GitHub release is created
4. Package is published to NPM

## Getting Help

If you need help:
- Check the [README](./README.md)
- Look at existing code and tests
- Create an issue with your question

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
