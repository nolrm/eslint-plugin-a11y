# Migration Guide: `eslint-plugin-test-a11y-js` → `eslint-plugin-a11y`

This guide covers migrating from the old package name to the new one released as v1.0.0.

## Why the rename?

The `test-` prefix implied this was a testing utility. The new name `eslint-plugin-a11y` is shorter, more accurate, and easier to discover.

**Nothing else changed.** All 43 rules, all config presets, and the programmatic A11yChecker API are identical. Only the package name and related identifiers changed.

---

## Step 1: Reinstall the package

```bash
npm uninstall eslint-plugin-test-a11y-js
npm install --save-dev eslint-plugin-a11y
```

---

## Step 2: Update your ESLint config

### Legacy config (`.eslintrc.js` / `.eslintrc.json`)

```diff
- "plugins": ["test-a11y-js"],
- "extends": ["plugin:test-a11y-js/recommended"]
+ "plugins": ["a11y"],
+ "extends": ["plugin:a11y/recommended"]
```

Other presets follow the same pattern:

| Old | New |
|-----|-----|
| `plugin:test-a11y-js/minimal` | `plugin:a11y/minimal` |
| `plugin:test-a11y-js/recommended` | `plugin:a11y/recommended` |
| `plugin:test-a11y-js/strict` | `plugin:a11y/strict` |
| `plugin:test-a11y-js/react` | `plugin:a11y/react` |
| `plugin:test-a11y-js/vue` | `plugin:a11y/vue` |

### Flat config (`eslint.config.js` / `eslint.config.mjs`)

```diff
- import testA11yJs from 'eslint-plugin-test-a11y-js'
+ import a11y from 'eslint-plugin-a11y'

  export default [
    {
-     plugins: { 'test-a11y-js': testA11yJs },
+     plugins: { 'a11y': a11y },
-     ...testA11yJs.configs['flat/recommended']
+     ...a11y.configs['flat/recommended']
    }
  ]
```

---

## Step 3: Update `settings` (if using component mapping)

> **This is a silent failure.** If you don't update this key, component mapping stops working with no error message.

```diff
  settings: {
-   'test-a11y-js': {
+   'a11y': {
      components: { Link: 'a', Button: 'button', Image: 'img' },
      polymorphicPropNames: ['as', 'component'],
      runtimeCheckedComment: 'a11y-checked-at-runtime'
    }
  }
```

---

## Step 4: Update `eslint-disable` comments

Any inline disable comments in your codebase that reference the old rule prefix must be updated manually. ESLint treats these as literal strings — they do not auto-update.

Find them all:

```bash
grep -rn "eslint-disable.*test-a11y-js" .
```

Then update each one:

```diff
- // eslint-disable-next-line test-a11y-js/image-alt
+ // eslint-disable-next-line a11y/image-alt
```

---

## Step 5: Update programmatic API imports

```diff
- import { A11yChecker } from 'eslint-plugin-test-a11y-js/core'
+ import { A11yChecker } from 'eslint-plugin-a11y/core'
```

```diff
- import formatter from 'eslint-plugin-test-a11y-js/formatter'
+ import formatter from 'eslint-plugin-a11y/formatter'
```

---

## Complete rule ID reference

All 43 rule IDs follow the same pattern — prefix changes from `test-a11y-js/` to `a11y/`:

| Old Rule ID | New Rule ID |
|-------------|-------------|
| `test-a11y-js/accessible-emoji` | `a11y/accessible-emoji` |
| `test-a11y-js/anchor-ambiguous-text` | `a11y/anchor-ambiguous-text` |
| `test-a11y-js/anchor-is-valid` | `a11y/anchor-is-valid` |
| `test-a11y-js/aria-activedescendant-has-tabindex` | `a11y/aria-activedescendant-has-tabindex` |
| `test-a11y-js/aria-validation` | `a11y/aria-validation` |
| `test-a11y-js/audio-captions` | `a11y/audio-captions` |
| `test-a11y-js/autocomplete-valid` | `a11y/autocomplete-valid` |
| `test-a11y-js/button-label` | `a11y/button-label` |
| `test-a11y-js/click-events-have-key-events` | `a11y/click-events-have-key-events` |
| `test-a11y-js/control-has-associated-label` | `a11y/control-has-associated-label` |
| `test-a11y-js/details-summary` | `a11y/details-summary` |
| `test-a11y-js/dialog-modal` | `a11y/dialog-modal` |
| `test-a11y-js/fieldset-legend` | `a11y/fieldset-legend` |
| `test-a11y-js/form-label` | `a11y/form-label` |
| `test-a11y-js/form-validation` | `a11y/form-validation` |
| `test-a11y-js/heading-has-content` | `a11y/heading-has-content` |
| `test-a11y-js/heading-order` | `a11y/heading-order` |
| `test-a11y-js/html-has-lang` | `a11y/html-has-lang` |
| `test-a11y-js/iframe-title` | `a11y/iframe-title` |
| `test-a11y-js/image-alt` | `a11y/image-alt` |
| `test-a11y-js/img-redundant-alt` | `a11y/img-redundant-alt` |
| `test-a11y-js/interactive-supports-focus` | `a11y/interactive-supports-focus` |
| `test-a11y-js/landmark-roles` | `a11y/landmark-roles` |
| `test-a11y-js/lang` | `a11y/lang` |
| `test-a11y-js/link-text` | `a11y/link-text` |
| `test-a11y-js/mouse-events-have-key-events` | `a11y/mouse-events-have-key-events` |
| `test-a11y-js/no-access-key` | `a11y/no-access-key` |
| `test-a11y-js/no-aria-hidden-on-focusable` | `a11y/no-aria-hidden-on-focusable` |
| `test-a11y-js/no-autofocus` | `a11y/no-autofocus` |
| `test-a11y-js/no-distracting-elements` | `a11y/no-distracting-elements` |
| `test-a11y-js/no-interactive-element-to-noninteractive-role` | `a11y/no-interactive-element-to-noninteractive-role` |
| `test-a11y-js/no-noninteractive-element-interactions` | `a11y/no-noninteractive-element-interactions` |
| `test-a11y-js/no-noninteractive-element-to-interactive-role` | `a11y/no-noninteractive-element-to-interactive-role` |
| `test-a11y-js/no-noninteractive-tabindex` | `a11y/no-noninteractive-tabindex` |
| `test-a11y-js/no-redundant-roles` | `a11y/no-redundant-roles` |
| `test-a11y-js/no-role-presentation-on-focusable` | `a11y/no-role-presentation-on-focusable` |
| `test-a11y-js/no-static-element-interactions` | `a11y/no-static-element-interactions` |
| `test-a11y-js/prefer-tag-over-role` | `a11y/prefer-tag-over-role` |
| `test-a11y-js/scope` | `a11y/scope` |
| `test-a11y-js/semantic-html` | `a11y/semantic-html` |
| `test-a11y-js/tabindex-no-positive` | `a11y/tabindex-no-positive` |
| `test-a11y-js/table-structure` | `a11y/table-structure` |
| `test-a11y-js/video-captions` | `a11y/video-captions` |
