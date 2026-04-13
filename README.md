# eslint-plugin-a11y

> **DEPRECATED:** This package has been renamed to [`eslint-plugin-a11y`](https://www.npmjs.com/package/eslint-plugin-a11y).
> Run: `npm install --save-dev eslint-plugin-a11y`
> See the [migration guide](./docs/MIGRATION_TO_A11Y.md) for details.

> **Catch accessibility issues in your editor, not in production.** Zero-config ESLint plugin + programmatic API for React, Vue, and JSX.

[![npm version](https://img.shields.io/npm/v/eslint-plugin-a11y.svg)](https://www.npmjs.com/package/eslint-plugin-a11y)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Why a11y?

- ✅ **Zero config** - Works out of the box with React, Vue, and JSX
- ✅ **Real-time feedback** - Catch issues in your editor, not in production
- ✅ **43 accessibility rules** - Covers images, forms, buttons, landmarks, ARIA, focus, and more
- ✅ **Editor suggestions** - Get actionable fixes directly in your editor
- ✅ **Dual API** - Use as ESLint plugin OR programmatic API
- ✅ **Large project ready** - Minimal preset for incremental adoption
- ✅ **Framework agnostic** - Works with React, Vue, Preact, Solid, and more
- ✅ **Fast & lightweight** - Pure AST validation, 35KB bundle, zero memory issues

## Installation

```bash
npm install --save-dev eslint-plugin-a11y
```

### Peer Dependencies

- `eslint` (>=8.0.0) - Required for ESLint plugin
- `vue-eslint-parser` (>=9.0.0) - Optional, only needed for Vue support
- `jsdom` (>=23.0.0) - Optional, only needed for A11yChecker core library (programmatic API)

**Note:** The ESLint plugin does NOT use jsdom. It performs pure AST validation for maximum performance. jsdom is only required if you use the programmatic A11yChecker API in your tests.

## Quick Start

### Option 1: ESLint Plugin (Recommended)

Add to your `.eslintrc.js` or `.eslintrc.json`:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended']
}
```

Or for React/JSX projects:

```javascript
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/react']
}
```

That's it! Start catching accessibility issues immediately in your editor.

### Option 2: Programmatic API

Use in your tests:

```typescript
import { A11yChecker } from 'eslint-plugin-a11y/core'

// Test a DOM element for accessibility violations
const violations = await A11yChecker.check(element)

// Or check specific patterns
const imageViolations = A11yChecker.checkImageAlt(element)
const buttonViolations = A11yChecker.checkButtonLabel(element)
```

## ESLint Plugin vs Programmatic API

**Use ESLint Plugin when:**
- ✅ You want real-time feedback in your editor
- ✅ You want to catch issues during development
- ✅ You want CI/CD integration to prevent commits with violations
- ✅ You want team-wide enforcement

**Use Programmatic API when:**
- ✅ You want to write specific accessibility tests
- ✅ You need to test dynamically generated DOM
- ✅ You want custom reporting or analytics
- ✅ You're writing integration/E2E tests

**You can use both!** Many teams use ESLint plugin for development and programmatic API for comprehensive test coverage.

## Configuration Options

### Available Presets

**Classic Config (.eslintrc.js):**
- `plugin:a11y/minimal` - Only 3 critical rules (best for large projects)
- `plugin:a11y/recommended` - Balanced approach (default)
- `plugin:a11y/strict` - All rules as errors
- `plugin:a11y/react` - Optimized for React/JSX
- `plugin:a11y/vue` - Optimized for Vue SFC

**Flat Config (eslint.config.js) - ESLint v9+:**
- `flat/recommended` - Rules only (minimal assumptions)
- `flat/recommended-react` - Rules + React parser
- `flat/react` - Full React setup
- `flat/vue` - Full Vue setup
- `flat/minimal` - Minimal rules only
- `flat/strict` - All rules as errors

### Framework-Specific Setup

**React/JSX:**
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

### Ignoring Rules

**Ignore a single line:**
```jsx
// eslint-disable-next-line a11y/image-alt
<img src="decorative.jpg" alt="" />
```

**Ignore an entire file:**
```jsx
/* eslint-disable a11y/heading-order */
```

**Ignore directories:**
```javascript
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.test.{js,ts,jsx,tsx}'
  ]
}
```

### Rule Options

Many rules support configuration options for fine-tuned control:

**image-alt - Decorative images:**
```javascript
{
  'a11y/image-alt': ['error', {
    allowMissingAltOnDecorative: true,
    decorativeMatcher: {
      markerAttributes: ['data-decorative']
    }
  }]
}
```

**link-text - Custom denylist:**
```javascript
{
  'a11y/link-text': ['warn', {
    denylist: ['click here', 'read more'],
    caseInsensitive: true
  }]
}
```

**heading-order - Skip tolerance:**
```javascript
{
  'a11y/heading-order': ['warn', {
    allowSameLevel: true,
    maxSkip: 2
  }]
}
```

See [Configuration Guide](./docs/CONFIGURATION.md) for all options.

### Component Mapping

Map your design-system components to native HTML elements:

```javascript
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  settings: {
    'a11y': {
      components: {
        Link: 'a',        // Treat <Link> as <a>
        Button: 'button', // Treat <Button> as <button>
        Image: 'img'      // Treat <Image> as <img>
      },
      polymorphicPropNames: ['as', 'component'] // Support <Link as="a">
    }
  }
}
```

Now rules apply to your components:
```jsx
<Link href="/about">Click here</Link> // ⚠️ Warning: nonDescriptive
<Button></Button> // ❌ Error: missingLabel
```

### Quick start with ESLint flat config (v9+)

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

These presets mirror the classic `.eslintrc` presets and are the easiest way to drop `eslint-plugin-a11y` into a modern ESLint v9+ setup, alongside `@eslint/js`, `typescript-eslint`, and `eslint-plugin-react`.

See [Configuration Guide](./docs/CONFIGURATION.md) for more flat-config examples and advanced setups.

## Editor Suggestions

Many rules provide **suggestions** that appear in your editor, allowing you to quickly fix issues:

- **iframe-title**: Suggests adding `title=""` placeholder
- **button-label**: Suggests adding `aria-label=""` for icon-only buttons
- **link-text**: Suggests replacing non-descriptive text
- **heading-order**: Suggests correct heading level

In VS Code and other editors with ESLint support, suggestions appear as Quick Fix options (Cmd/Ctrl + .).

**Note**: Suggestions are **not** autofixes - they require manual review and approval.

## ESLint Rules

The plugin provides **43 accessibility rules**:

**Core rules:**
- `a11y/image-alt` - Enforce images, `input[type=image]`, and `area` elements have alt attributes
- `a11y/button-label` - Enforce buttons have labels
- `a11y/link-text` - Enforce links have descriptive text
- `a11y/form-label` - Enforce form controls have labels
- `a11y/heading-order` - Enforce proper heading hierarchy
- `a11y/iframe-title` - Enforce iframes have title attributes
- `a11y/fieldset-legend` - Enforce fieldsets have legend elements
- `a11y/table-structure` - Enforce tables have proper structure
- `a11y/details-summary` - Enforce details elements have summary
- `a11y/video-captions` - Enforce video elements have caption tracks
- `a11y/audio-captions` - Enforce audio elements have tracks or transcripts
- `a11y/landmark-roles` - Enforce proper use of landmark elements
- `a11y/dialog-modal` - Enforce dialog elements have proper accessibility attributes
- `a11y/aria-validation` - Validate ARIA roles, properties, and ID references (AST-first)
- `a11y/semantic-html` - Enforce proper use of semantic HTML elements (AST-first)
- `a11y/form-validation` - Validate form validation patterns (AST-first)

**Attribute & document rules:**
- `a11y/no-access-key` - Disallow accessKey on elements
- `a11y/no-autofocus` - Disallow autoFocus
- `a11y/tabindex-no-positive` - Disallow positive tabIndex
- `a11y/no-distracting-elements` - Disallow blink and marquee
- `a11y/lang` - Enforce valid lang attribute values
- `a11y/html-has-lang` - Enforce html element has lang attribute

**Focusable & ARIA rules:**
- `a11y/no-aria-hidden-on-focusable` - Disallow aria-hidden on focusable elements
- `a11y/no-role-presentation-on-focusable` - Disallow role="presentation" on focusable elements
- `a11y/no-interactive-element-to-noninteractive-role` - Disallow role="none/presentation" on interactive elements (button, a, input, etc.)
- `a11y/no-noninteractive-element-to-interactive-role` - Disallow interactive roles on non-interactive elements without keyboard support
- `a11y/no-redundant-roles` - Disallow explicit roles that match the element's implicit ARIA role
- `a11y/prefer-tag-over-role` - Prefer semantic native HTML elements over ARIA role attributes on generic elements
- `a11y/control-has-associated-label` - Enforce ARIA-role interactive controls have an accessible label
- `a11y/scope` - Enforce valid use of the scope attribute on `<th>` elements
- `a11y/aria-activedescendant-has-tabindex` - Enforce aria-activedescendant targets are focusable

**Event & keyboard rules:**
- `a11y/click-events-have-key-events` - Enforce onClick has keyboard equivalent
- `a11y/mouse-events-have-key-events` - Enforce mouse handlers have keyboard equivalent
- `a11y/no-static-element-interactions` - Disallow static handlers on non-interactive elements
- `a11y/no-noninteractive-element-interactions` - Disallow interactive handlers on non-interactive elements
- `a11y/interactive-supports-focus` - Enforce interactive elements are focusable
- `a11y/no-noninteractive-tabindex` - Disallow tabindex on non-interactive elements

**Content & media rules:**
- `a11y/heading-has-content` - Enforce headings have content
- `a11y/img-redundant-alt` - Enforce img alt does not contain redundant words
- `a11y/anchor-ambiguous-text` - Enforce link text is not generic
- `a11y/anchor-is-valid` - Enforce anchors have valid href (not empty, `#`, or `javascript:`)
- `a11y/accessible-emoji` - Enforce emoji have accessible labels
- `a11y/autocomplete-valid` - Enforce autocomplete attribute is valid

## Programmatic API

### A11yChecker Methods

```typescript
import { A11yChecker } from 'eslint-plugin-a11y/core'

// Comprehensive check
const results = await A11yChecker.check(element)

// Individual checks
A11yChecker.checkImageAlt(element)
A11yChecker.checkButtonLabel(element)
A11yChecker.checkLinkText(element)
A11yChecker.checkFormLabels(element)
A11yChecker.checkHeadingOrder(element)
A11yChecker.checkIframeTitle(element)
A11yChecker.checkFieldsetLegend(element)
A11yChecker.checkTableStructure(element)
A11yChecker.checkDetailsSummary(element)
A11yChecker.checkVideoCaptions(element)
A11yChecker.checkAudioCaptions(element)
A11yChecker.checkLandmarks(element)
A11yChecker.checkDialogModal(element)

// Advanced checks (available in core library)
A11yChecker.checkAriaRoles(element)
A11yChecker.checkAriaProperties(element)
A11yChecker.checkAriaRelationships(element)
A11yChecker.checkAccessibleName(element)
A11yChecker.checkCompositePatterns(element)
A11yChecker.checkSemanticHTML(element)
A11yChecker.checkFormValidationMessages(element)
```

### Types

```typescript
interface A11yViolation {
  id: string
  description: string
  element: Element
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
}

interface A11yResults {
  violations: A11yViolation[]
}
```

## Examples

### React Component

```tsx
// ❌ ESLint will catch this
function MyComponent() {
  return (
    <div>
      <img src="photo.jpg" />  {/* Missing alt */}
      <button></button>         {/* No label */}
    </div>
  )
}

// ✅ Fixed
function MyComponent() {
  return (
    <div>
      <img src="photo.jpg" alt="A beautiful landscape" />
      <button aria-label="Close menu">×</button>
    </div>
  )
}
```

### Vue Component

```vue
<!-- ❌ ESLint will catch this -->
<template>
  <img src="photo.jpg" />
  <button></button>
</template>

<!-- ✅ Fixed -->
<template>
  <img src="photo.jpg" alt="A beautiful landscape" />
  <button aria-label="Close menu">×</button>
</template>
```

### Using in Tests

```typescript
import { render } from '@testing-library/react'
import { A11yChecker } from 'eslint-plugin-a11y/core'

test('component is accessible', async () => {
  const { container } = render(<MyComponent />)
  const results = await A11yChecker.check(container)
  expect(results.violations).toHaveLength(0)
})
```

## Large Projects

For large codebases, start with minimal rules:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/minimal'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**']
}
```

See [Large Project Setup Guide](./docs/LARGE_PROJECTS.md) for incremental adoption strategies.

## Progress Display (Optional)

The plugin includes a progress-aware ESLint wrapper that shows which files are being linted, similar to Vite's test output.

### Quick Setup for Next.js Projects

Replace `next lint` with the progress wrapper in your `package.json`:

```json
{
  "scripts": {
    "lint": "node node_modules/eslint-plugin-a11y/bin/eslint-with-progress.js",
    "lint:fix": "node node_modules/eslint-plugin-a11y/bin/eslint-with-progress.js --fix"
  }
}
```

Or use the binary directly:

```bash
npx eslint-with-progress
```

### What You Get

- ✅ **Progress display** - Shows "Linting files..." message
- ✅ **File-by-file results** with line numbers
- ✅ **Summary** showing total files, errors, and warnings
- ✅ **Color-coded** output (errors in red, warnings in yellow)
- ✅ **Timing information**

Example output:
```
Linting files...

src/components/Button.tsx
  5:12  ✖ Image missing alt attribute (a11y/image-alt)
  8:3   ⚠ Button should have accessible label (a11y/button-label)

────────────────────────────────────────────────────────────

Summary: 15 files linted • 2 errors • 5 warnings

Completed in 1.23s
```

**Note:** This is optional. Your plugin rules work automatically with `next lint` - this just adds progress display.

## Performance

For large projects, use ESLint caching:

```bash
npx eslint . --cache
```

See [Performance Guide](./docs/PERFORMANCE.md) for optimization tips.

## Framework Support

- ✅ **React/JSX** - Full support via JSX AST
- ✅ **Vue** - Full support via vue-eslint-parser
- ✅ **HTML Strings** - Support for template literals (requires jsdom for core API)
- ✅ **Any JSX-based framework** - Preact, Solid, etc.

## Documentation

- [Configuration Guide](./docs/CONFIGURATION.md) - ESLint plugin configuration options, rule options, component mapping
- [Migration Guide](./docs/MIGRATION_FROM_JSX_A11Y.md) - Migrate from eslint-plugin-jsx-a11y
- [Large Project Setup Guide](./docs/LARGE_PROJECTS.md) - Incremental adoption strategies
- [Performance Guide](./docs/PERFORMANCE.md) - Performance optimization tips
- [ESLint Plugin Guide](./docs/ESLINT_PLUGIN.md) - Complete ESLint plugin documentation
- [Vue Usage Guide](./docs/VUE_USAGE.md) - Vue-specific setup and examples
- [Examples](./docs/EXAMPLES.md) - Real-world code examples
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [JSDOM Guide](./docs/JSDOM.md) - When and how to use jsdom

## How It Compares

### When to use this vs other a11y tools?

- **vs `eslint-plugin-jsx-a11y`**: Similar JSX accessibility coverage, plus Vue SFC support, flat-config presets, and a matching runtime `A11yChecker` API. You can run both plugins side by side and selectively disable overlapping rules in either one.
- **vs `eslint-plugin-vuejs-accessibility`**: This plugin covers both Vue templates *and* JSX/TSX with a single rule set, which is useful in mixed React/Vue or design-system-heavy codebases.
- **vs runtime-only tools (e.g. `@axe-core/react`)**: `a11y` focuses on **static**, editor-time feedback and CI linting, while the runtime A11yChecker API complements it for dynamic DOM testing.

For rule-by-rule mapping from `eslint-plugin-jsx-a11y` to `eslint-plugin-a11y`, see the [Migration Guide](./docs/MIGRATION_FROM_JSX_A11Y.md).

### Feature comparison

| Feature | a11y | eslint-plugin-jsx-a11y | @axe-core/react |
|---------|--------------|------------------------|-----------------|
| Zero config | ✅ | ❌ | ❌ |
| Vue support | ✅ | ❌ | ❌ |
| Programmatic API | ✅ | ❌ | ✅ |
| Editor integration | ✅ | ✅ | ❌ |
| Large project ready | ✅ | ⚠️ | ⚠️ |
| Framework agnostic | ✅ | React only | React only |

## FAQ

- **Does this replace `eslint-plugin-jsx-a11y`?**  
  Not necessarily. It can replace it in many React-only projects, but it also adds Vue SFC support, flat-config presets, and a runtime A11yChecker API. You can also run both plugins side by side and disable overlapping rules where needed.

- **Can I run `eslint-plugin-a11y` and `eslint-plugin-jsx-a11y` together?**  
  Yes. Add both plugins to your config and then selectively turn off overlapping rules in one or the other. The [Migration Guide](./docs/MIGRATION_FROM_JSX_A11Y.md) shows rule mappings and suggestions.

- **Does it support ESLint v9 flat config?**  
  Yes. All presets have `flat/*` equivalents (for example, `flat/recommended`, `flat/recommended-react`, `flat/vue`, `flat/minimal`, `flat/strict`). See the flat-config quick start above or the [Configuration Guide](./docs/CONFIGURATION.md).

- **Does it work with Vue Single File Components (SFC)?**  
  Yes. Install `vue-eslint-parser` and use the `vue` presets (classic or `flat/vue`). The flat-config example above shows how to scope Vue rules to `**/*.vue` files.

- **Why does it warn on dynamic `alt`/text instead of erroring?**  
  Dynamic attributes (like `alt={altText}`) cannot be fully validated statically. The plugin treats them as warnings by default and expects you to cover them via runtime checks using the A11yChecker API or other testing tools.

## Contributing

Contributions are welcome! After cloning, `npm install` runs the `prepare` script (build + ContextKit git hooks; hooks live in `.contextkit/hooks/`). Please see the [contributing guidelines](CONTRIBUTING.md) for more information.

## Author

Marlon Maniti (https://github.com/nolrm)

## License

MIT
