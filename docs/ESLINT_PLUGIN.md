# ESLint Plugin Documentation

Complete guide to using the `a11y` ESLint plugin for accessibility linting.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Rules Reference](#rules-reference)
- [Configuration](#configuration)
- [Framework Support](#framework-support)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

The `a11y` ESLint plugin provides real-time accessibility linting for your code. It checks for common accessibility violations directly in your editor and during CI/CD builds.

### Features

- ✅ **Real-time feedback** - Catch accessibility issues as you code
- ✅ **Multi-framework support** - Works with React, Vue, and HTML
- ✅ **Configurable** - Multiple presets and customizable rules
- ✅ **CI/CD ready** - Integrates seamlessly with existing ESLint workflows
- ✅ **Framework-agnostic core** - Same accessibility logic across all frameworks
- ✅ **Editor suggestions** - Get actionable fixes directly in your editor
- ✅ **AST-first validation** - Fast, memory-efficient linting without runtime dependencies

## Installation

```bash
npm install --save-dev eslint-plugin-a11y eslint
```

### Peer Dependencies

- `eslint` (>=8.0.0) - Required
- `vue-eslint-parser` (>=9.0.0) - Optional, only needed for Vue support

For Vue projects:

```bash
npm install --save-dev vue-eslint-parser
```

## Quick Start

### ESLint v9+ flat config (recommended)

```js
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import testA11y from 'eslint-plugin-a11y'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: {
      react,
      'a11y': testA11y
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    ...testA11y.configs['flat/recommended-react']
  },

  // Optional: Vue-specific rules only on .vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      'a11y': testA11y
    },
    ...testA11y.configs['flat/vue']
  }
]
```

This is the recommended configuration style for new projects using ESLint v9+.

### Legacy configuration (.eslintrc*, ESLint v8)

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended']
}
```

#### React/JSX Setup (legacy)

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true }
  },
  plugins: ['a11y'],
  extends: ['plugin:a11y/react']
}
```

#### Vue Setup (legacy)

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

## Rules Reference

### Summary table

This table provides a high-level overview of the accessibility rules exposed by the ESLint plugin.

| Rule | What it checks | Default level | Included in presets (classic + flat) | Closest `eslint-plugin-jsx-a11y` rule |
|------|----------------|---------------|--------------------------------------|---------------------------------------|
| `a11y/image-alt` | `img` alt text, decorative images | `error` | `plugin:a11y/minimal`, `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/minimal`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | `alt-text` |
| `a11y/button-label` | Buttons have accessible labels | `error` | `plugin:a11y/minimal`, `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/minimal`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | Covers parts of: `button-has-type`, `click-events-have-key-events` |
| `a11y/link-text` | Descriptive link text, denylist phrases | `warn` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | Covers parts of: `anchor-is-valid`, `no-redundant-roles` |
| `a11y/form-label` | Form controls have labels | `error` | `plugin:a11y/minimal`, `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/minimal`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | `label-has-associated-control` |
| `a11y/heading-order` | Heading hierarchy, skip tolerance | `warn` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | No direct equivalent (related to `heading-has-content`) |
| `a11y/iframe-title` | `iframe` elements have titles | `error` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | `iframe-has-title` |
| `a11y/fieldset-legend` | `fieldset` elements have legends | `error` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | `fieldset-has-label` |
| `a11y/table-structure` | Table headers, scopes, structure | `error` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | Covers parts of: `scope`, `no-noninteractive-element-to-interactive-role` |
| `a11y/details-summary` | `details` have visible `summary` | `error` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | No direct equivalent (pattern-specific) |
| `a11y/video-captions` | `<video>` tracks / captions | `error` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | `media-has-caption` |
| `a11y/audio-captions` | `<audio>` captions / transcripts | `error` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | No direct equivalent (pattern-specific) |
| `a11y/landmark-roles` | Landmarks and regions | `warn` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | Covers parts of: `landmark-no-duplicate-main`, `aria-roles` |
| `a11y/dialog-modal` | Accessible dialogs and modals | `error` | `plugin:a11y/recommended`, `plugin:a11y/react`, `plugin:a11y/vue`, `plugin:a11y/strict`, `flat/recommended`, `flat/recommended-react`, `flat/react`, `flat/vue`, `flat/strict` | Covers parts of: `aria-roles`, `aria-props` |
| `a11y/aria-validation` | ARIA roles, properties, ID refs (AST-first) | `error` | `plugin:a11y/strict`, `flat/strict` (opt-in for `plugin:a11y/recommended`, `flat/recommended`) | `aria-roles`, `aria-props`, `aria-unsupported-elements` |
| `a11y/semantic-html` | Prefer semantic elements over generic+role | `error` | `plugin:a11y/strict`, `flat/strict` (opt-in for `plugin:a11y/recommended`, `flat/recommended`) | Covers parts of: `no-redundant-roles`, `prefer-tag-over-role` |
| `a11y/form-validation` | Required fields, ID refs, validation patterns | `error` | `plugin:a11y/strict`, `flat/strict` (opt-in for `plugin:a11y/recommended`, `flat/recommended`) | Covers parts of: `label-has-associated-control`, `aria-props` |

For migration guidance from `eslint-plugin-jsx-a11y`, see the [Migration Guide](./MIGRATION_FROM_JSX_A11Y.md).

### a11y/image-alt

Enforces that images have `alt` attributes for accessibility.

**Severity:** `error` (recommended)

**Messages:**
- `missingAlt` - Image must have an alt attribute
- `emptyAlt` - Image alt attribute must not be empty
- `dynamicAlt` - Image alt attribute is dynamic. Ensure it is not empty at runtime.

**Examples:**

```jsx
// ❌ Missing alt
<img src="photo.jpg" />

// ❌ Empty alt
<img src="photo.jpg" alt="" />

// ✅ Valid
<img src="photo.jpg" alt="A beautiful landscape" />

// ⚠️ Dynamic (warning)
<img src="photo.jpg" alt={altText} />
```

### a11y/button-label

Enforces that buttons have labels or `aria-label` attributes.

**Severity:** `error` (recommended)

**Messages:**
- `missingLabel` - Button must have a label or aria-label
- `dynamicLabel` - Button label is dynamic. Ensure it is not empty at runtime.

**Examples:**

```jsx
// ❌ Missing label
<button></button>

// ✅ Valid with text
<button>Click me</button>

// ✅ Valid with aria-label
<button aria-label="Close menu">×</button>

// ⚠️ Dynamic (warning)
<button aria-label={dynamicLabel}></button>
```

### a11y/link-text

Enforces that links have descriptive text.

**Severity:** `warn` (recommended)

**Messages:**
- `missingText` - Link must have descriptive text
- `nonDescriptive` - Link text should be more descriptive (avoid "click here", "read more", etc.)
- `dynamicText` - Link text is dynamic. Ensure it is descriptive at runtime.

**Examples:**

```jsx
// ❌ Missing text
<a href="/about"></a>

// ⚠️ Non-descriptive
<a href="/about">Click here</a>
<a href="/blog">Read more</a>

// ✅ Valid
<a href="/about">About Us</a>
<a href="/blog">Read our blog posts</a>
```

### a11y/form-label

Enforces that form controls have associated labels.

**Severity:** `error` (recommended)

**Messages:**
- `missingLabel` - Form control must have an associated label (use id/for, aria-label, or aria-labelledby)

**Examples:**

```jsx
// ❌ Missing label
<input type="text" />

// ✅ Valid with id/for
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ Valid with aria-label
<input type="email" aria-label="Email address" />

// ✅ Valid with aria-labelledby
<span id="email-label">Email</span>
<input type="email" aria-labelledby="email-label" />
```

### a11y/heading-order

Enforces proper heading hierarchy (no skipped levels).

**Severity:** `warn` (recommended)

**Messages:**
- `skippedLevel` - Heading level skipped (previous: {previous}, current: {current})

**Examples:**

```jsx
// ✅ Valid hierarchy
<h1>Title</h1>
<h2>Subtitle</h2>
<h3>Section</h3>

// ⚠️ Skipped level
<h1>Title</h1>
<h3>Section</h3> // Skipped h2

// ✅ Same level is OK
<h2>First</h2>
<h2>Second</h2>
<h3>Section</h3>
```

### a11y/aria-validation

Validates ARIA roles, properties, and ID references (AST-first, no JSDOM).

**Severity:** `error` (strict preset, opt-in for recommended)

**Messages:**
- `ariaViolation` - ARIA validation error (invalid role, property, or reference)

**Examples:**

```jsx
// ❌ Invalid role
<div role="invalid-role">Content</div>

// ⚠️ Redundant role
<button role="button">Click</button>

// ❌ Invalid ID reference
<input aria-labelledby="missing-id" />

// ✅ Valid
<div role="dialog" aria-label="Modal">Content</div>
<label id="email-label">Email</label>
<input aria-labelledby="email-label" />
```

**Note**: This rule is AST-first and validates within the same file only. Cross-file ID references are not validated.

### a11y/semantic-html

Enforces proper use of semantic HTML elements over generic elements with roles.

**Severity:** `error` (strict preset, opt-in for recommended)

**Messages:**
- `semanticViolation` - Semantic HTML violation

**Examples:**

```jsx
// ⚠️ Redundant role
<button role="button">Click</button>

// ⚠️ Prefer semantic element
<div role="button">Click</div> // Should use <button>

// ✅ Valid
<button>Click</button>
<nav>Navigation</nav>
```

### a11y/form-validation

Validates form validation patterns and ID references.

**Severity:** `error` (strict preset, opt-in for recommended)

**Messages:**
- `formValidationViolation` - Form validation error

**Examples:**

```jsx
// ❌ Required input without label
<input type="text" required />

// ❌ Invalid ID reference
<input aria-describedby="missing-id" />

// ✅ Valid
<input type="text" required aria-label="Name" />
<label id="email-label">Email</label>
<input type="email" required aria-labelledby="email-label" />
```

## Configuration

See [Configuration Guide](./CONFIGURATION.md) for detailed configuration options.

### Flat Config Presets (ESLint v9+)

These presets are designed to be spread into your `eslint.config.js`:

- **`flat/minimal`** – Only 3 critical rules (`image-alt`, `button-label`, `form-label`)
- **`flat/recommended`** – Balanced rules, framework-agnostic
- **`flat/recommended-react`** – Recommended rules + JSX parser options
- **`flat/react`** – React-focused rules + JSX parser options
- **`flat/vue`** – Vue SFC rules + `vue-eslint-parser` setup
- **`flat/strict`** – All rules set to `error`

Example:

```js
// eslint.config.js
import testA11y from 'eslint-plugin-a11y'

export default [
  {
    plugins: {
      'a11y': testA11y
    },
    ...testA11y.configs['flat/minimal']
  }
]
```

### Legacy Presets (.eslintrc*, ESLint v8)

- `plugin:a11y/minimal` – 3 critical rules only
- `plugin:a11y/recommended` – Balanced approach (default)
- `plugin:a11y/strict` – All rules as errors
- `plugin:a11y/react` – Optimized for React/JSX
- `plugin:a11y/vue` – Optimized for Vue SFC

Custom configuration (legacy):

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  rules: {
    // Override specific rules
    'a11y/image-alt': 'error',
    'a11y/link-text': 'warn',
    
    // Disable a rule
    'a11y/heading-order': 'off'
  }
}
```

## Framework Support

### React/JSX

Full support for JSX syntax:

```jsx
function MyComponent() {
  return (
    <div>
      <img src="photo.jpg" alt="Photo" />
      <button aria-label="Close">×</button>
      <a href="/about">About Us</a>
    </div>
  )
}
```

### Vue

Full support for Vue Single File Components:

```vue
<template>
  <img src="photo.jpg" alt="Photo" />
  <button aria-label="Close">×</button>
  <a href="/about">About Us</a>
</template>
```

Supports:
- Regular attributes: `<img alt="Photo" />`
- v-bind syntax: `<img :alt="altText" />`
- Shorthand: `<img :alt="altText" />`

### HTML Strings

Support for HTML in template literals:

```javascript
const html = `<img src="photo.jpg" alt="Photo" />`
```

## Suggestions & Editor UX

Many rules provide **suggestions** that appear in your editor, allowing you to quickly fix issues with a single click.

### Available Suggestions

#### iframe-title
- **Suggestion**: Add `title=""` attribute placeholder when missing

#### button-label
- **Suggestion**: Add `aria-label=""` for icon-only buttons

#### link-text
- **Suggestion**: Replace non-descriptive text (e.g., "click here") with descriptive placeholder

#### heading-order
- **Suggestion**: Consider using the correct heading level (e.g., `h2` instead of `h3`)

### Using Suggestions

In VS Code and other editors with ESLint support, suggestions appear as:
- **Quick Fix** options (Cmd/Ctrl + .)
- **Lightbulb** icons next to errors
- **Hover tooltips** with fix descriptions

**Note**: Suggestions are **not** autofixes - they require manual review and approval to ensure correctness.

## Static lint + runtime checks (why this exists)

The `a11y` plugin uniquely supports both static linting (ESLint) and runtime testing (A11yChecker). This allows you to catch issues during development while also ensuring comprehensive test coverage.

At a high level:

- **Static ESLint rules** catch structural issues (missing `alt`, unlabeled buttons, bad headings, etc.) directly in your editor and CI.
- **Runtime A11yChecker** covers **dynamic props and conditional rendering** that static analysis cannot reliably validate.
- A special **runtime comment convention** (`runtimeCheckedComment`) tells the linter, “this code is covered by runtime checks,” preventing noisy false positives while keeping intent explicit.

### Runtime Comment Convention

For patterns that are difficult to validate statically (e.g., dynamic props, complex conditional rendering), you can mark them as "checked at runtime" using a special comment. This suppresses ESLint warnings while maintaining visibility.

**Configuration:**

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  settings: {
    'a11y': {
      runtimeCheckedComment: 'a11y-checked-at-runtime', // Default
      runtimeCheckedMode: 'suppress' // 'suppress' or 'downgrade' (default: 'downgrade')
    }
  }
}
```

**Usage:**

```jsx
function DynamicImage({ src, alt }) {
  return (
    <div>
      {/* a11y-checked-at-runtime */}
      <img src={src} alt={alt} />
    </div>
  )
}

// In your test file:
import { A11yChecker } from 'eslint-plugin-a11y/core'
import { render } from '@testing-library/react'

test('DynamicImage is accessible', async () => {
  const { container } = render(<DynamicImage src="/photo.jpg" alt="Photo" />)
  const results = await A11yChecker.check(container)
  expect(results.violations).toHaveLength(0)
})
```

**Comment Modes:**

- **`suppress`**: Fully suppresses ESLint warnings for marked code
- **`downgrade`** (default): Maintains visibility but acknowledges runtime coverage

**Comment Placement:**

Comments apply to the node and its descendants. Place the comment:
- Before the element: `{/* comment */} <img />`
- On the parent element to cover all children: `{/* comment */} <div><img /></div>`

### Rule → A11yChecker API Mapping

Each ESLint rule has a corresponding A11yChecker method for runtime testing:

| ESLint Rule | A11yChecker Method |
|------------|-------------------|
| `a11y/image-alt` | `A11yChecker.checkImageAlt(element)` |
| `a11y/button-label` | `A11yChecker.checkButtonLabel(element)` |
| `a11y/link-text` | `A11yChecker.checkLinkText(element)` |
| `a11y/form-label` | `A11yChecker.checkFormLabels(element)` |
| `a11y/heading-order` | `A11yChecker.checkHeadingOrder(element)` |
| `a11y/iframe-title` | `A11yChecker.checkIframeTitle(element)` |
| `a11y/fieldset-legend` | `A11yChecker.checkFieldsetLegend(element)` |
| `a11y/table-structure` | `A11yChecker.checkTableStructure(element)` |
| `a11y/details-summary` | `A11yChecker.checkDetailsSummary(element)` |
| `a11y/video-captions` | `A11yChecker.checkVideoCaptions(element)` |
| `a11y/audio-captions` | `A11yChecker.checkAudioCaptions(element)` |
| `a11y/landmark-roles` | `A11yChecker.checkLandmarks(element)` |
| `a11y/dialog-modal` | `A11yChecker.checkDialogModal(element)` |
| `a11y/aria-validation` | `A11yChecker.checkAriaRoles(element)` |
| `a11y/semantic-html` | `A11yChecker.checkSemanticHTML(element)` |
| `a11y/form-validation` | `A11yChecker.checkFormValidationMessages(element)` |

**Example Workflow:**

```jsx
// Component with dynamic props
function ProductCard({ product }) {
  return (
    <div>
      {/* a11y-checked-at-runtime */}
      <img src={product.image} alt={product.name} />
      <button onClick={handleClick}>{product.actionText}</button>
    </div>
  )
}

// Test file
import { A11yChecker } from 'eslint-plugin-a11y/core'
import { render } from '@testing-library/react'

test('ProductCard is accessible', async () => {
  const product = { image: '/photo.jpg', name: 'Product', actionText: 'Buy' }
  const { container } = render(<ProductCard product={product} />)
  
  // Runtime check covers what ESLint can't verify statically
  const results = await A11yChecker.check(container)
  expect(results.violations).toHaveLength(0)
})
```

**Benefits:**

- ✅ **Static linting** catches issues during development
- ✅ **Runtime testing** validates dynamic content and complex patterns
- ✅ **Reduced false positives** by marking runtime-checked code
- ✅ **Comprehensive coverage** with both static and runtime validation

## Examples

### Complete React Component

```tsx
// ❌ Violations
function BadComponent() {
  return (
    <div>
      <img src="header.jpg" />
      <button></button>
      <a href="/more">Read more</a>
      <input type="text" />
      <h1>Title</h1>
      <h3>Section</h3>
    </div>
  )
}

// ✅ Fixed
function GoodComponent() {
  return (
    <div>
      <img src="header.jpg" alt="Site header" />
      <button aria-label="Submit form">Submit</button>
      <a href="/blog">Read our blog posts</a>
      <label htmlFor="name">Name</label>
      <input id="name" type="text" />
      <h1>Title</h1>
      <h2>Subtitle</h2>
      <h3>Section</h3>
    </div>
  )
}
```

### Complete Vue Component

```vue
<!-- ❌ Violations -->
<template>
  <img src="header.jpg" />
  <button></button>
  <a href="/more">Read more</a>
  <input type="text" />
  <h1>Title</h1>
  <h3>Section</h3>
</template>

<!-- ✅ Fixed -->
<template>
  <img src="header.jpg" alt="Site header" />
  <button aria-label="Submit form">Submit</button>
  <a href="/blog">Read our blog posts</a>
  <label for="name">Name</label>
  <input id="name" type="text" />
  <h1>Title</h1>
  <h2>Subtitle</h2>
  <h3>Section</h3>
</template>
```

## Troubleshooting

### Rules Not Working

1. **Check installation**: Ensure `a11y` and `eslint` are installed
2. **Verify plugin**: Check that `plugins: ['a11y']` is in your config
3. **Check parser**: For React, ensure JSX is enabled. For Vue, ensure `vue-eslint-parser` is used
4. **File extensions**: Ensure your file extensions (`.jsx`, `.vue`, etc.) are included in ESLint's file patterns

### Too Many Errors

If you're getting overwhelmed by violations:

1. **Start with recommended**: Use `plugin:a11y/recommended` which uses warnings for moderate issues
2. **Fix incrementally**: Address violations one at a time
3. **Use disable comments**: Temporarily disable rules for exceptions:
   ```jsx
   // eslint-disable-next-line a11y/image-alt
   <img src="decorative.jpg" alt="" />
   ```
4. **Gradually increase strictness**: Move to strict configuration once compliant

### Vue-Specific Issues

1. **Parser not found**: Ensure `vue-eslint-parser` is installed
2. **Rules not running**: Verify `.vue` files are included in ESLint's file patterns
3. **Dynamic attributes**: Dynamic attributes will show warnings (not errors) - this is expected

### Dynamic Attributes

The plugin cannot statically verify dynamic attribute values. It will warn (not error) when it detects dynamic attributes:

```jsx
// ⚠️ Warning (not error)
<img alt={altText} />
<button aria-label={label}></button>
```

This is intentional - ensure your dynamic values are always set at runtime.

## Best Practices

1. **Start with recommended**: Begin with the recommended configuration
2. **Fix incrementally**: Don't try to fix everything at once
3. **Use strict in CI/CD**: Use strict configuration in CI/CD pipelines
4. **Document exceptions**: Use ESLint disable comments with explanations
5. **Test with screen readers**: ESLint catches many issues, but manual testing is still important

## Integration with CI/CD

Add ESLint to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run ESLint
  run: npm run lint
```

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.vue"
  }
}
```

## Related Documentation

- [Configuration Guide](./CONFIGURATION.md) - Detailed configuration options
- [Vue Usage Guide](./VUE_USAGE.md) - Vue-specific setup and examples
- [Testing Guide](./TESTING.md) - Testing the plugin

## Support

For issues, questions, or contributions, please visit:
- GitHub: https://github.com/nolrm/eslint-plugin-a11y
- Issues: https://github.com/nolrm/eslint-plugin-a11y/issues

