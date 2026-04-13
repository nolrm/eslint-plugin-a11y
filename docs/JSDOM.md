# jsdom Dependency Guide

## When is jsdom needed?

jsdom is only required if you use HTML strings in your code that need to be linted:

```javascript
// This requires jsdom
const html = `<img src="photo.jpg" />`
```

```jsx
// This does NOT require jsdom (uses JSX AST)
<img src="photo.jpg" />
```

## Installation

### Option 1: Install as optional dependency

```bash
npm install --save-dev jsdom
```

### Option 2: Skip HTML string checks

If you don't use HTML strings, you can skip jsdom installation. The plugin will gracefully skip HTML string checks.

## Verification

Check if jsdom is available:

```bash
npm list jsdom
```

If not installed, you'll see a warning in ESLint output (non-blocking):

```
[a11y] jsdom not found. HTML string parsing will be skipped.
Install jsdom if you need HTML string accessibility checks: npm install --save-dev jsdom
```

## Impact

Without jsdom:
- ✅ JSX/TSX files work normally (uses AST parsing)
- ✅ Vue files work normally (uses AST parsing)
- ⚠️ HTML string literals will be skipped
- ⚠️ HTML template literals will be skipped

## When to install jsdom

Install jsdom if you:
- Use HTML strings in your code
- Use template literals with HTML content
- Need to lint HTML strings for accessibility

You can skip jsdom if you:
- Only use JSX/TSX
- Only use Vue templates
- Don't have HTML strings in your codebase

## Troubleshooting

### Warning: jsdom not found

This is a non-blocking warning. The plugin will continue to work, but HTML string checks will be skipped.

**Solution:** Install jsdom if you need HTML string checks:
```bash
npm install --save-dev jsdom
```

### Error: Cannot find module 'jsdom'

If you see this error, it means jsdom is required but not installed. Install it:
```bash
npm install --save-dev jsdom
```

