# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD.

## Workflows

### CI (`ci.yml`)
Runs on every push and pull request to `main` and `develop` branches:
- Runs pre-check (build, test, lint, type-check)
- Tests on Node.js 18.x and 20.x
- Generates test coverage reports

### Publish (`publish.yml`)
Automatically publishes to npm when `package.json` changes on the `main` branch.

**Workflow steps:**
1. Checkout code
2. Setup Node.js with npm registry
3. Install dependencies
4. Build the project
5. Run core tests
6. Run lint
7. Run type-check
8. Verify build output exists
9. Check if version already exists on npm
10. Publish to npm (if version is new)

## Setup

### NPM Trusted Publisher (OIDC) - Recommended

This workflow uses npm's Trusted Publisher feature with OpenID Connect (OIDC) for secure authentication. No secrets needed!

1. Go to your package on npm: https://www.npmjs.com/package/eslint-plugin-a11y
2. Navigate to: **Settings → Access → Trusted Publishers**
3. Click **"Add Trusted Publisher"**
4. Fill in:
   - **Repository**: `nolrm/eslint-plugin-a11y`
   - **Workflow name**: `Publish to npm`
   - **Environment**: (leave empty unless using GitHub Environments)
5. Click **"Add"**

The workflow will automatically authenticate using OIDC - no `NPM_TOKEN` secret required!

### Alternative: NPM Token (Not Recommended)

If OIDC doesn't work for your setup, you can use a token (not recommended for security reasons):

1. Go to [npmjs.com](https://www.npmjs.com/settings/YOUR_USERNAME/tokens) and create an access token
   - Token type: **Automation** (for CI/CD)
   - Scopes: **Read and Publish**
2. Add it as a secret in GitHub:
   - Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm access token
   - Click "Add secret"
3. Update the workflow to add `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` to the publish step

## Publishing a New Version

The workflow automatically publishes when you update `package.json` and push to `main`:

```bash
# 1. Update version in package.json
npm version patch   # for 0.3.0 → 0.3.1
# or
npm version minor   # for 0.3.0 → 0.4.0
# or
npm version major   # for 0.3.0 → 1.0.0

# 2. Push to main (this triggers the workflow)
git push origin main
```

The workflow will automatically:
- Run build, tests, lint, and type-check
- Check if the version already exists on npm
- Publish to npm (if version is new)
- Skip publish if version already exists

**Optional:** Create a git tag for the release:
```bash
VERSION=$(node -p "require('./package.json').version")
git tag v$VERSION
git push origin v$VERSION
```

## Pre-check Requirements

The `pre-check` script must pass before publishing. It runs:
- ✅ `npm run build` - Builds the project
- ✅ `npm run test:core` - Runs critical tests
- ✅ `npm run lint` - Lints source code
- ✅ `npm run type-check` - Type-checks source code

If any step fails, the publish job will **not** run, preventing broken releases.

## Troubleshooting

### Workflow fails at pre-check
- Check the workflow logs to see which step failed
- Fix the issue locally by running `npm run pre-check`
- Commit and push the fix

### Workflow fails at publish
- Verify Trusted Publisher is configured correctly on npm
- Check that the workflow name matches exactly: `Publish to npm`
- Check that the repository name matches exactly: `nolrm/eslint-plugin-a11y`
- If using token fallback, verify `NPM_TOKEN` secret is set correctly
- Check that the version doesn't already exist on npm
- Ensure you have publish permissions on npm

### Version already exists
- Update to a new version in `package.json`
- Create a new tag with the updated version

## Security

- OIDC (Trusted Publisher) is the recommended authentication method (no secrets needed)
- If using token fallback, never commit `NPM_TOKEN` to the repository
- Use GitHub Secrets for all sensitive tokens
- Tokens should have minimal required permissions (Read and Publish only)
