# Performance Guide

## ESLint Performance Best Practices

### 1. Always Use Cache

```bash
# Enable caching
npx eslint . --cache

# Cache location (optional)
npx eslint . --cache --cache-location .eslintcache
```

Add to `.gitignore`:
```
.eslintcache
```

### 2. Limit File Scope

```javascript
// .eslintrc.js
module.exports = {
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.min.js'
  ]
}
```

### 3. Use Overrides for Performance

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['test-a11y-js'],
  extends: ['plugin:test-a11y-js/recommended'],
  overrides: [
    {
      files: ['**/*.test.{js,ts,jsx,tsx}'],
      rules: {
        'test-a11y-js/**': 'off' // Skip tests for speed
      }
    }
  ]
}
```

### 4. Disable Slow Rules on Large Files

Some rules are slower on large files:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // These can be slow on very large files
    'test-a11y-js/heading-order': 'warn', // Checks all headings
    'test-a11y-js/landmark-roles': 'warn' // Checks all landmarks
  }
}
```

### 5. Parallel Execution

Use tools like `eslint-parallel`:

```bash
npm install --save-dev eslint-parallel

# Run in parallel
npx eslint-parallel src/
```

### 6. Incremental Checks

Only check changed files:

```bash
# Git-based incremental
npx eslint $(git diff --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx|vue)$')
```

## Benchmarking

Measure ESLint performance:

```bash
# Time ESLint execution
time npx eslint . --cache

# Profile with Node
node --prof node_modules/.bin/eslint . --cache
```

## Expected Performance

- Small project (<100 files): <5 seconds
- Medium project (100-1000 files): 10-30 seconds
- Large project (1000+ files): 30-120 seconds (with cache)

With cache enabled, subsequent runs should be 5-10x faster.

## Configuration Impact

### Minimal Config (3 rules)
- Fastest execution
- ~30% faster than recommended
- Best for large projects starting out

### Recommended Config (30 rules)
- Balanced performance
- Standard execution time
- Good for most projects

### Strict Config (43 rules, all errors)
- Same performance characteristics as recommended
- More errors reported (not slower)

## Tips for Large Projects

1. **Start with minimal**: Use `plugin:test-a11y-js/minimal` initially
2. **Use cache**: Always enable `--cache` flag
3. **Limit scope**: Use `ignorePatterns` to exclude build outputs
4. **Incremental adoption**: Check only new/modified files first
5. **Disable slow rules**: Temporarily disable `heading-order` and `landmark-roles` if needed

