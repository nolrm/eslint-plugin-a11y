# Integration Guide

This document explains how to integrate the `eslint-plugin-a11y` ESLint plugin into your project.

> **Note:** For detailed ESLint configuration options, see [Configuration Guide](./CONFIGURATION.md). For comprehensive plugin documentation, see [ESLint Plugin Guide](./ESLINT_PLUGIN.md).

## Package Exports

The package provides two main export paths:

### Main Export (ESLint Plugin)

```javascript
// ESM
import plugin from 'eslint-plugin-a11y'

// CJS
const plugin = require('eslint-plugin-a11y')
```

### Core Library Export

```javascript
// ESM
import { A11yChecker } from 'eslint-plugin-a11y/core'

// CJS
const { A11yChecker } = require('eslint-plugin-a11y/core')
```

## Build Output

The build process generates the following files:

### Main Library
- `dist/index.js` - CommonJS format
- `dist/index.mjs` - ES Module format
- `dist/index.d.ts` - TypeScript definitions

### ESLint Plugin
- `dist/linter/eslint-plugin/index.js` - CommonJS format
- `dist/linter/eslint-plugin/index.mjs` - ES Module format
- `dist/linter/eslint-plugin/index.d.ts` - TypeScript definitions

## Package.json Configuration

The package.json is configured with proper exports:

```json
{
  "name": "eslint-plugin-a11y",
  "main": "dist/linter/eslint-plugin/index.js",
  "module": "dist/linter/eslint-plugin/index.mjs",
  "types": "dist/linter/eslint-plugin/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/linter/eslint-plugin/index.mjs",
      "require": "./dist/linter/eslint-plugin/index.js",
      "types": "./dist/linter/eslint-plugin/index.d.ts"
    },
    "./core": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## ESLint Integration

### Basic Setup

1. Install the package:
```bash
npm install --save-dev eslint-plugin-a11y eslint
```

2. Configure ESLint:
```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended']
}
```

### Framework-Specific Setup

**React:**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true }
  },
  plugins: ['a11y'],
  extends: ['plugin:a11y/react']
}
```

**Vue:**
```bash
npm install --save-dev vue-eslint-parser
```

```javascript
module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  plugins: ['a11y'],
  extends: ['plugin:a11y/vue']
}
```

## Verification

### Check Installation

Verify the plugin is installed correctly:

```bash
npm list a11y
```

### Test ESLint Configuration

Run ESLint to verify the plugin is working:

```bash
npx eslint your-file.jsx
```

### Verify Plugin Structure

The plugin should export:
- `meta` - Plugin metadata
- `rules` - All 43 accessibility rules
- `configs` - All 5 configuration presets (minimal, recommended, strict, react, vue)

## Troubleshooting

### Plugin not found

If ESLint can't find the plugin:

1. Verify installation: `npm list eslint-plugin-a11y`
2. Check plugin name in ESLint config: `plugins: ['a11y']`
3. Ensure the package is in `node_modules`

### Rules not working

If rules aren't being applied:

1. Verify the config extends the plugin: `extends: ['plugin:a11y/recommended']`
2. Check that your parser supports JSX (for React) or Vue (for Vue)
3. Ensure file extensions are included in ESLint's file patterns

### Build issues

If you encounter build issues:

1. Run `npm run build` to rebuild
2. Check that all files exist in `dist/`
3. Verify `package.json` exports are correct

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run ESLint
  run: npm run lint
```

### Pre-commit Hook

Using husky and lint-staged:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": ["eslint --fix"]
  }
}
```

## Next Steps

- See [Configuration Guide](./CONFIGURATION.md) for configuration options
- See [Vue Usage Guide](./VUE_USAGE.md) for Vue-specific setup
- Check the [README](../README.md) for quick start examples

