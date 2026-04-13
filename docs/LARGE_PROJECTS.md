# Large Project Setup Guide

This guide helps you integrate `a11y` into large codebases with minimal disruption.

## Quick Start for Large Projects

### Step 1: Install

```bash
npm install --save-dev eslint-plugin-a11y eslint
```

### Step 2: Start with Minimal Configuration

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/minimal'],
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ]
}
```

This enables only 3 critical rules:
- `button-label` - Buttons must have labels
- `form-label` - Form controls must have labels  
- `image-alt` - Images must have alt text

### Step 3: Run ESLint with Cache

```bash
# First run (slower)
npx eslint . --cache

# Subsequent runs (faster)
npx eslint . --cache
```

## Incremental Adoption Strategy

### Week 1: Minimal Rules (New Code Only)

Enable minimal rules but only check new/modified files:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/minimal']
}
```

```bash
# Only check staged files (git)
npx eslint $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx|vue)$')
```

### Week 2-4: Expand to Recommended (Modified Files)

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended']
}
```

Focus on fixing violations in files you're actively working on.

### Month 2+: Full Coverage

Gradually expand to check entire codebase:

```bash
# Check specific directories first
npx eslint src/components/ --cache
npx eslint src/pages/ --cache

# Then expand to full codebase
npx eslint . --cache
```

## Performance Optimization

### 1. Use ESLint Cache

Always use `--cache` flag:

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --cache",
    "lint:fix": "eslint . --cache --fix"
  }
}
```

### 2. Limit File Scope

```bash
# Check only source files
npx eslint src/ --cache

# Exclude test files
npx eslint src/ --cache --ignore-pattern '**/*.test.*'
```

### 3. Disable Slow Rules Temporarily

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  rules: {
    // Disable if too slow on large files
    'a11y/heading-order': 'off',
    'a11y/landmark-roles': 'off'
  }
}
```

### 4. Use Overrides for Specific Paths

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  overrides: [
    {
      files: ['src/components/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'a11y/**': 'error' // Strict in components
      }
    },
    {
      files: ['src/utils/**/*.{js,ts}'],
      rules: {
        'a11y/**': 'off' // Disable in utils
      }
    }
  ]
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint -- --cache --cache-location .eslintcache
```

## Troubleshooting Performance

### Issue: ESLint is too slow

**Solutions:**
1. Use `--cache` flag
2. Limit file scope with `ignorePatterns`
3. Start with `minimal` config
4. Disable slow rules temporarily
5. Use `--max-warnings` to limit output

```bash
npx eslint . --cache --max-warnings 100
```

### Issue: Too many violations

**Solutions:**
1. Start with `minimal` config
2. Use `--max-warnings` flag
3. Focus on new code first
4. Gradually expand scope

## Migration Checklist

- [ ] Install `a11y`
- [ ] Add minimal config to `.eslintrc.js`
- [ ] Add ignore patterns for build outputs
- [ ] Test on small directory first
- [ ] Enable ESLint cache
- [ ] Run on CI/CD
- [ ] Gradually expand to recommended config
- [ ] Fix violations incrementally

