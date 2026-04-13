# Breaking Changes Archive

## v1.0.0 — Package Rename

### What changed

The package was renamed from `eslint-plugin-test-a11y-js` to `eslint-plugin-a11y`. The ESLint short name changed from `test-a11y-js` to `a11y`.

### Migration

```bash
npm uninstall eslint-plugin-test-a11y-js
npm install --save-dev eslint-plugin-a11y
```

Update your config:

| Old | New |
|-----|-----|
| `plugins: ['test-a11y-js']` | `plugins: ['a11y']` |
| `plugin:test-a11y-js/recommended` | `plugin:a11y/recommended` |
| `test-a11y-js/image-alt` (rule IDs) | `a11y/image-alt` |
| `settings['test-a11y-js']` | `settings['a11y']` |

> **Silent failure risk:** If you use component mapping via `settings['test-a11y-js']`, updating this key is required — there is no error if the old key is present, it is simply ignored.

> **`eslint-disable` comments:** Any `// eslint-disable-next-line test-a11y-js/rule-name` comments in your codebase must be updated manually. Find them with:
> ```bash
> grep -rn "eslint-disable.*test-a11y-js" .
> ```

See [docs/MIGRATION_TO_A11Y.md](./docs/MIGRATION_TO_A11Y.md) for the complete guide.

---

> **Note:** This document is kept for historical reference. Since the package is new and has no existing users, breaking changes have been removed and the API is now stable.

## Previous Versions

### v0.10.0 (Archived)

Version 0.10.0 fixed critical memory exhaustion issues in large projects by refactoring the ESLint plugin to use pure AST validation instead of JSDOM.

**Key improvements:**
- 73% smaller bundle (132KB → 35KB)
- Zero memory issues
- Faster linting
- 13 active rules (3 rules temporarily disabled for refactoring)

### v0.9.0 (Archived)

The package was renamed from `a11y` to `eslint-plugin-a11y` to follow ESLint naming conventions.

---

**Current Status:** The package API is now stable. All breaking changes have been resolved and the current version provides a clean, consistent API.
