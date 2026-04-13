# Troubleshooting Guide

Common issues and solutions when using the `a11y` ESLint plugin.

## Table of Contents

- [Rules Not Working](#rules-not-working)
- [Too Many Errors](#too-many-errors)
- [Vue-Specific Issues](#vue-specific-issues)
- [React/JSX Issues](#reactjsx-issues)
- [Dynamic Attributes](#dynamic-attributes)
- [Parser Errors](#parser-errors)
- [Performance Issues](#performance-issues)
- [CI/CD Integration](#cicd-integration)

## Rules Not Working

### Issue: Rules are not being triggered

**Symptoms:**
- No ESLint errors/warnings for accessibility violations
- Rules appear in ESLint config but don't run

**Solutions:**

1. **Verify plugin installation:**
   ```bash
   npm list eslint-plugin-a11y eslint
   ```

2. **Check ESLint configuration:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     plugins: ['a11y'], // Must be included
     extends: ['plugin:a11y/recommended']
   }
   ```

3. **Verify file extensions:**
   Ensure your file extensions are included in ESLint's file patterns:
   ```json
   // package.json
   {
     "scripts": {
       "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue"
     }
   }
   ```

4. **Check ESLint version:**
   Requires ESLint >= 8.0.0:
   ```bash
   npm list eslint
   ```

5. **Restart your editor:**
   Some editors cache ESLint configurations. Restart your editor or ESLint server.

### Issue: Plugin not found

**Symptoms:**
- Error: "Plugin 'a11y' was not found"

**Solutions:**

1. **Reinstall the plugin:**
   ```bash
   npm install --save-dev eslint-plugin-a11y
   ```

2. **Check node_modules:**
   ```bash
   ls node_modules/eslint-plugin-a11y
   ```

3. **Clear cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

## Too Many Errors

### Issue: Overwhelmed by violations

**Symptoms:**
- Hundreds of ESLint errors
- Can't see other issues
- Build fails due to too many errors

**Solutions:**

1. **Start with recommended configuration:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     extends: ['plugin:a11y/recommended'] // Uses warnings for moderate issues
   }
   ```

2. **Disable specific rules temporarily:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     rules: {
       'a11y/heading-order': 'off', // Disable temporarily
       'a11y/link-text': 'warn' // Change to warning
     }
   }
   ```

3. **Use disable comments for exceptions:**
   ```jsx
   // eslint-disable-next-line a11y/image-alt
   <img src="decorative.jpg" alt="" />
   ```

4. **Fix incrementally:**
   - Start with critical errors (image-alt, button-label, form-label)
   - Then address warnings (link-text, heading-order)
   - Gradually move to strict configuration

5. **Use file-level disable:**
   ```jsx
   /* eslint-disable a11y/heading-order */
   // Entire file exempt from heading-order rule
   ```

## Vue-Specific Issues

### Issue: Vue rules not working

**Symptoms:**
- Rules work for JSX but not Vue files
- No errors in `.vue` files

**Solutions:**

1. **Install vue-eslint-parser:**
   ```bash
   npm install --save-dev vue-eslint-parser
   ```

2. **Configure parser:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     parser: 'vue-eslint-parser',
     parserOptions: {
       parser: '@typescript-eslint/parser'
     },
     plugins: ['a11y'],
     extends: ['plugin:a11y/vue']
   }
   ```

3. **Verify .vue files are included:**
   ```bash
   eslint --ext .vue src/
   ```

4. **Check Vue file structure:**
   Ensure your `.vue` files have a `<template>` section:
   ```vue
   <template>
     <img src="photo.jpg" alt="Photo" />
   </template>
   ```

### Issue: Dynamic attributes showing warnings

**Symptoms:**
- Getting warnings for `:alt="dynamicValue"` even when value is set

**Solutions:**

1. **This is expected behavior:**
   The plugin cannot statically verify dynamic values. Warnings (not errors) are shown.

2. **Suppress warnings if needed:**
   ```vue
   <!-- eslint-disable-next-line a11y/image-alt -->
   <img :src="imageUrl" :alt="altText" />
   ```

3. **Ensure runtime values:**
   Make sure your dynamic values are always set:
   ```vue
   <script>
   export default {
     data() {
       return {
         altText: 'Default alt text' // Always set
       }
     }
   }
   </script>
   ```

## React/JSX Issues

### Issue: JSX not being parsed

**Symptoms:**
- Rules work for HTML but not JSX
- Parser errors for JSX syntax

**Solutions:**

1. **Configure JSX parser:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     parser: '@typescript-eslint/parser',
     parserOptions: {
       ecmaFeatures: {
         jsx: true // Enable JSX
       }
     },
     plugins: ['a11y'],
     extends: ['plugin:a11y/react']
   }
   ```

2. **Use React preset:**
   ```javascript
   extends: ['plugin:a11y/react']
   ```

3. **Check file extensions:**
   Ensure `.jsx` and `.tsx` files are included:
   ```bash
   eslint --ext .js,.jsx,.ts,.tsx src/
   ```

### Issue: TypeScript JSX errors

**Symptoms:**
- Parser errors with TypeScript JSX
- Rules not working in `.tsx` files

**Solutions:**

1. **Use TypeScript parser:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     parser: '@typescript-eslint/parser',
     parserOptions: {
       ecmaFeatures: { jsx: true },
       project: './tsconfig.json'
     },
     plugins: ['a11y', '@typescript-eslint'],
     extends: [
       'plugin:@typescript-eslint/recommended',
       'plugin:a11y/react'
     ]
   }
   ```

## Dynamic Attributes

### Issue: Getting warnings for dynamic attributes

**Symptoms:**
- Warnings for `alt={variable}` or `:alt="variable"`
- Want to suppress these warnings

**Solutions:**

1. **Understand the behavior:**
   - Dynamic attributes show warnings (not errors)
   - This is intentional - plugin cannot verify runtime values
   - Ensure values are always set at runtime

2. **Suppress if necessary:**
   ```jsx
   // eslint-disable-next-line a11y/image-alt
   <img src={imageUrl} alt={altText} />
   ```

3. **Use default values:**
   ```jsx
   <img src={imageUrl} alt={altText || 'Default description'} />
   ```

## Parser Errors

### Issue: ESLint parser errors

**Symptoms:**
- "Parsing error: Unexpected token"
- "Cannot read property 'name' of undefined"

**Solutions:**

1. **Check parser configuration:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     parser: '@typescript-eslint/parser', // or 'vue-eslint-parser'
     parserOptions: {
       ecmaVersion: 2020,
       sourceType: 'module',
       ecmaFeatures: { jsx: true } // For React
     }
   }
   ```

2. **Verify parser is installed:**
   ```bash
   npm list @typescript-eslint/parser vue-eslint-parser
   ```

3. **Check file extensions:**
   Ensure parser matches file type:
   - `.jsx`, `.tsx` → `@typescript-eslint/parser` with JSX enabled
   - `.vue` → `vue-eslint-parser`

## Performance Issues

### Issue: ESLint is slow

**Symptoms:**
- ESLint takes a long time to run
- Editor is laggy

**Solutions:**

1. **Limit file scope:**
   ```bash
   eslint src/components/ --ext .jsx,.vue
   ```

2. **Use ESLint cache:**
   ```bash
   eslint --cache src/
   ```

3. **Disable rules if needed:**
   ```javascript
   rules: {
     'a11y/heading-order': 'off' // Disable if too slow
   }
   ```

4. **Check for large files:**
   Very large files can slow down parsing. Consider splitting files.

## CI/CD Integration

### Issue: Build fails in CI/CD

**Symptoms:**
- Local linting passes but CI fails
- Different behavior in CI vs local

**Solutions:**

1. **Use strict configuration in CI:**
   ```javascript
   // .eslintrc.ci.js
   module.exports = {
     extends: ['plugin:a11y/strict']
   }
   ```

2. **Ensure dependencies are installed:**
   ```yaml
   # GitHub Actions
   - name: Install dependencies
     run: npm ci
   ```

3. **Check Node version:**
   Ensure CI uses compatible Node version (>=14)

4. **Verify file patterns:**
   ```bash
   eslint . --ext .js,.jsx,.vue
   ```

### Issue: Different results locally vs CI

**Solutions:**

1. **Use lock file:**
   ```bash
   npm ci # Instead of npm install
   ```

2. **Check ESLint version:**
   Ensure same ESLint version in both environments

3. **Clear cache:**
   ```bash
   eslint --cache-location .eslintcache .
   ```

## Getting Help

If you're still experiencing issues:

1. **Check existing issues:**
   https://github.com/nolrm/eslint-plugin-a11y/issues

2. **Create a minimal reproduction:**
   - Small code example
   - ESLint configuration
   - Error messages

3. **Include environment info:**
   - Node version
   - ESLint version
   - Plugin version
   - Framework (React/Vue)

4. **Open an issue:**
   https://github.com/nolrm/eslint-plugin-a11y/issues/new

