# NPM Publishing Setup

This document explains how to set up automated NPM publishing for this package.

## Prerequisites

1. NPM account with publishing rights
2. NPM access token
3. GitHub repository with Actions enabled

## Setup Steps

### 1. Create NPM Access Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Click on your profile avatar → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" type (for CI/CD)
5. Copy the generated token

### 2. Add NPM Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your NPM access token
6. Click "Add secret"

### 3. Publishing Methods

#### Method 1: Create a GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Create a new tag (e.g., `v1.0.1`)
4. Fill in the release title and description
5. Click "Publish release"
6. The GitHub Action will automatically:
   - Run tests
   - Build the package
   - Publish to NPM with the `latest` tag

#### Method 2: Use the Release Workflow

1. Go to Actions tab on GitHub
2. Select "Release" workflow
3. Click "Run workflow"
4. Choose version bump type (patch/minor/major)
5. Select if it's a prerelease
6. Click "Run workflow"
7. The workflow will:
   - Bump the version
   - Update CHANGELOG
   - Create a git tag
   - Create a GitHub release
   - Trigger the publish workflow

#### Method 3: Manual Publish with Custom Tag

1. Go to Actions tab on GitHub
2. Select "Publish to NPM" workflow
3. Click "Run workflow"
4. Choose NPM tag (latest, beta, next, canary)
5. Click "Run workflow"
6. The workflow will publish to NPM with the selected tag

## NPM Tags

- `latest`: Production-ready releases (default)
- `beta`: Beta releases for testing
- `next`: Next version previews
- `canary`: Cutting-edge, unstable releases

## Version Management

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Verification

After publishing, verify the package:

1. Check NPM: `npm view playwright-jira-guard`
2. Test installation: `npm install playwright-jira-guard@latest`
3. Verify in a test project

## Troubleshooting

### "npm ERR! 403 Forbidden"

- Verify NPM_TOKEN secret is set correctly
- Ensure your NPM account has publishing rights
- Check if the package name is available

### "npm ERR! 402 Payment Required"

- You may need to configure your organization's billing
- Make sure you're publishing to the correct scope

### Workflow fails on tests

- Fix any failing tests locally first
- Ensure all tests pass before creating a release

## Security

- Never commit NPM tokens to the repository
- Regularly rotate your NPM access tokens
- Use GitHub Secrets for storing sensitive information
- Enable two-factor authentication on your NPM account

## Additional Resources

- [NPM Access Tokens Documentation](https://docs.npmjs.com/about-access-tokens)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Publishing Node.js Packages](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
