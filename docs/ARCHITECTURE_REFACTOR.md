# Architecture Refactor - v0.10.0

## Overview

Version 0.10.0 introduces a major architectural change to fix critical memory issues in the ESLint plugin while maintaining the full power of the A11yChecker core library.

## The Problem

### Memory Exhaustion in Large Projects

```
FATAL ERROR: Ineffective mark-compacts near heap limit
Allocation failed - JavaScript heap out of memory
```

**Root Cause:**
- ESLint rules were importing `A11yChecker` from the core library
- `A11yChecker` uses JSDOM (a full DOM implementation) for runtime HTML validation
- JSDOM was being bundled into the ESLint plugin (132KB bundle)
- When ESLint ran in large projects, JSDOM instances would accumulate, causing memory exhaustion

### Why This Happened

The ESLint plugin rules were written to:
1. Parse JSX/Vue AST nodes
2. Convert them to DOM elements using JSDOM
3. Run A11yChecker validation on the DOM elements

This was **architecturally incorrect** because:
- ESLint rules should do **static analysis** (checking source code syntax)
- A11yChecker is designed for **runtime validation** (checking rendered HTML)
- Mixing the two caused JSDOM to be loaded during ESLint runs

## The Solution

### Separation of Concerns

We now have **two distinct use cases** with **two separate tools**:

#### 1. ESLint Plugin - Static Analysis (Compile-Time)

**Purpose:** Check JSX/Vue source code for accessibility issues during development

**How it works:**
- Pure AST (Abstract Syntax Tree) validation
- No DOM, no JSDOM, no runtime dependencies
- Checks syntax: "Does this `<img>` have an `alt` attribute?"
- Fast, lightweight (35KB bundle, down from 132KB - 73% reduction)

**Usage:**
```json
{
  "extends": ["plugin:a11y/recommended"]
}
```

#### 2. A11yChecker Core - Runtime Validation (Test-Time)

**Purpose:** Validate actual rendered HTML in tests, browsers, or runtime

**How it works:**
- Uses JSDOM to create a full DOM environment
- Checks computed accessibility tree
- Validates relationships, ARIA patterns, composite widgets
- More comprehensive but heavier

**Usage:**
```javascript
import { A11yChecker } from 'eslint-plugin-a11y/core'

// Test actual rendered output
const html = document.getElementById('myComponent').outerHTML
const violations = A11yChecker.check(html)
```

## What Changed in v0.10.0

### Changes to ESLint Rules

**Before v0.10.0:**
```typescript
// ❌ OLD APPROACH - Caused memory issues
import { A11yChecker } from '../../../core/a11y-checker'

JSXOpeningElement(node) {
  const element = jsxToElement(node, context) // Convert to DOM
  const violations = A11yChecker.checkImageAlt(element) // Run JSDOM
  // Report violations
}
```

**After v0.10.0:**
```typescript
// ✅ NEW APPROACH - Pure AST validation
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'

JSXOpeningElement(node) {
  if (!hasJSXAttribute(node, 'alt')) {
    context.report({ messageId: 'missingAlt' })
  }
  // Check attribute values directly from AST
}
```

### Bundle Size Reduction

| Component | Before (v0.9.x) | After (v0.10.2) | Change |
|-----------|--------|-------|--------|
| ESLint Plugin | 132KB | 35KB | **-73%** |
| Core Library | 115KB | 96KB | -16% (optimized) |

### Rules Status

#### Active Rules (13) ✅

These rules now use pure AST validation:

1. **image-alt** - Images must have alt attributes
2. **button-label** - Buttons must have labels
3. **link-text** - Links must have descriptive text
4. **form-label** - Form controls must have labels
5. **heading-order** - Headings must be in logical order
6. **iframe-title** - iframes must have title attributes
7. **fieldset-legend** - Fieldsets must have legends
8. **table-structure** - Tables must have proper structure
9. **details-summary** - Details elements must have summaries
10. **video-captions** - Videos should have captions
11. **audio-captions** - Audio should have captions
12. **landmark-roles** - Proper use of landmark roles
13. **dialog-modal** - Dialogs must be properly marked

#### Temporarily Disabled Rules (3) ⚠️

These rules require more complex refactoring and are disabled until they can be rewritten with AST validation:

1. **aria-validation** - Comprehensive ARIA validation
2. **semantic-html** - Semantic HTML usage
3. **form-validation** - Form validation patterns

## Migration Guide

### For Plugin Users

**No action required** if you're just using the ESLint plugin. It will work better with v0.10.0!

```json
{
  "extends": ["plugin:a11y/recommended"]
}
```

**What you might notice:**
- ✅ Faster linting
- ✅ No more memory errors
- ⚠️ 3 rules temporarily disabled (will be re-enabled in future releases)

### For Core Library Users

**No change!** The A11yChecker API is identical:

```javascript
import { A11yChecker } from 'eslint-plugin-a11y/core'

// Still works exactly the same
const violations = A11yChecker.check('<img src="test.jpg">')
```

### Breaking Changes

1. **3 ESLint rules temporarily disabled**
   - `aria-validation`
   - `semantic-html`
   - `form-validation`
   
   If you were explicitly using these rules, they won't run until re-enabled in a future version.

2. **Bundle structure change**
   - ESLint plugin no longer includes JSDOM
   - If you were somehow relying on JSDOM being available through the plugin, use the core library instead

## When to Use What

### Use ESLint Plugin When:

✅ You want to catch accessibility issues **during development**
✅ You're checking **source code** (JSX, Vue, TSX)
✅ You need **fast feedback** in your IDE
✅ You want **zero runtime overhead**

**Example:**
```jsx
// ESLint will catch this during development
<img src="logo.png" /> // ❌ Missing alt attribute
```

### Use A11yChecker Core When:

✅ You want to test **rendered HTML output**
✅ You're writing **integration tests**
✅ You need to check **computed accessibility tree**
✅ You need comprehensive **ARIA validation**

**Example:**
```javascript
// Test the actual rendered component
const { container } = render(<MyComponent />)
const violations = A11yChecker.check(container.innerHTML)
expect(violations).toHaveLength(0)
```

## Technical Details

### How AST Validation Works

Instead of converting JSX to DOM and checking the DOM, we now check the JSX AST directly:

```typescript
// Check if attribute exists
if (!hasJSXAttribute(node, 'alt')) {
  // Report violation
}

// Check if attribute is empty
const altAttr = getJSXAttribute(node, 'alt')
if (altAttr.value.value === '') {
  // Report violation
}

// Check if attribute is dynamic
if (isJSXAttributeDynamic(altAttr)) {
  // Warn that it should be checked at runtime
}
```

### Limitations of AST Validation

AST validation is **syntactic**, not **semantic**. This means:

**Can check:**
- ✅ Presence of attributes (`alt`, `aria-label`, etc.)
- ✅ Static attribute values
- ✅ Element structure and nesting
- ✅ Simple patterns

**Cannot check:**
- ❌ Computed values from props/state
- ❌ Dynamic content
- ❌ Complex ARIA relationships
- ❌ Accessibility tree structure

That's why **both tools** are important:
- **ESLint** catches 80% of issues during development
- **A11yChecker** catches the remaining 20% in tests

## Future Roadmap

### Short Term (v0.11.x)

- [ ] Re-enable `aria-validation` with AST-based checks
- [ ] Re-enable `semantic-html` with AST-based checks
- [ ] Re-enable `form-validation` with AST-based checks
- [ ] Add more granular rule options

### Medium Term (v0.12.x)

- [ ] Add support for more frameworks (Angular, Solid)
- [ ] Improve dynamic attribute handling
- [ ] Better integration with testing libraries

### Long Term (v1.x)

- [ ] Unified validation API
- [ ] Custom rule authoring guide
- [ ] Performance optimizations

## Contributing

### Adding New ESLint Rules

**✅ DO:**
- Use AST utilities (`hasJSXAttribute`, `hasVueAttribute`, etc.)
- Check static values in the source code
- Keep rules simple and fast
- Avoid importing from `../../core`

**❌ DON'T:**
- Import `A11yChecker` or anything from `core/`
- Use `jsxToElement`, `htmlNodeToElement`, or `vueElementToDOM`
- Try to parse dynamic values
- Bundle JSDOM or heavy dependencies

### Example Rule Template

```typescript
import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Your rule description',
      recommended: true
    },
    messages: {
      missingAttribute: 'Element must have attribute'
    }
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        if (jsxNode.name?.name === 'img') {
          if (!hasJSXAttribute(jsxNode, 'alt')) {
            context.report({
              node,
              messageId: 'missingAttribute'
            })
          }
        }
      }
    }
  }
}

export default rule
```

## Questions?

- **Why not just make JSDOM optional?** 
  - ESLint plugins should be lightweight. Even optional JSDOM would increase bundle size.
  
- **Will the disabled rules come back?**
  - Yes! They just need to be rewritten to use AST validation instead of JSDOM.

- **Can I still use A11yChecker?**
  - Absolutely! It's the recommended tool for runtime testing.

- **Is this a breaking change?**
  - Technically yes (3 rules disabled), but it fixes critical memory issues affecting production use.

## Related Documentation

- [Configuration Guide](./CONFIGURATION.md)
- [ESLint Plugin Usage](./ESLINT_PLUGIN.md)
- [Integration Testing](./INTEGRATION.md)
- [Performance Guide](./PERFORMANCE.md)

