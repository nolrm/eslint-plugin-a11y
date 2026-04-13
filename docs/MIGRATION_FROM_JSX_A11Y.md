# Migration Guide: From eslint-plugin-jsx-a11y to a11y

This guide helps you migrate from `eslint-plugin-jsx-a11y` to `eslint-plugin-a11y`.

## Why Migrate?

- ✅ **Zero config** - Works out of the box
- ✅ **Vue support** - Full Vue SFC support (jsx-a11y is React-only)
- ✅ **Component mapping** - Built-in support for design-system components
- ✅ **Flat config ready** - ESLint v9+ support
- ✅ **Dual API** - ESLint plugin + programmatic A11yChecker API
- ✅ **Smaller bundle** - 35KB vs larger jsx-a11y bundle

## Rule Mapping

Audited against `src/linter/eslint-plugin/index.ts` (43 rules). Config Preset indicates which 1.0 presets include the rule: **minimal** (3 rules), **recommended** (30 rules), **strict** (43 rules).

| jsx-a11y Rule | a11y Rule | Config Preset | Notes |
|---------------|-------------------|---------------|-------|
| `jsx-a11y/alt-text` | `a11y/image-alt` | minimal, recommended, strict | Enhanced with decorative image options |
| `jsx-a11y/anchor-is-valid` | `a11y/anchor-is-valid` | recommended, strict | Href/link validation; see also `link-text` for descriptive text |
| `jsx-a11y/aria-activedescendant-has-tabindex` | `a11y/aria-activedescendant-has-tabindex` | recommended, strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-props` | `a11y/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-proptypes` | `a11y/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-role` | `a11y/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-unsupported-elements` | `a11y/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/click-events-have-key-events` | `a11y/click-events-have-key-events` | recommended, strict | ✅ Available |
| `jsx-a11y/heading-has-content` | `a11y/heading-has-content` | recommended, strict | ✅ Available; see also `heading-order` for hierarchy |
| `jsx-a11y/html-has-lang` | `a11y/html-has-lang` | recommended, strict | ✅ Available (contextual: &lt;html&gt; in scope) |
| `jsx-a11y/iframe-has-title` | `a11y/iframe-title` | recommended, strict | ✅ Available |
| `jsx-a11y/img-redundant-alt` | `a11y/img-redundant-alt` | strict | ✅ Available (dedicated rule) |
| `jsx-a11y/interactive-supports-focus` | `a11y/interactive-supports-focus` | recommended, strict | ✅ Available |
| `jsx-a11y/label-has-associated-control` | `a11y/form-label` | minimal, recommended, strict | ✅ Available |
| `jsx-a11y/media-has-caption` | `a11y/video-captions`, `a11y/audio-captions` | recommended, strict | ✅ Available |
| `jsx-a11y/mouse-events-have-key-events` | `a11y/mouse-events-have-key-events` | strict | ✅ Available |
| `jsx-a11y/no-access-key` | `a11y/no-access-key` | recommended, strict | ✅ Available |
| `jsx-a11y/no-autofocus` | `a11y/no-autofocus` | recommended, strict | ✅ Available |
| `jsx-a11y/no-distracting-elements` | `a11y/no-distracting-elements` | recommended, strict | ✅ Available |
| `jsx-a11y/no-interactive-element-to-noninteractive-role` | `a11y/no-interactive-element-to-noninteractive-role` | recommended, strict | ✅ Available |
| `jsx-a11y/no-noninteractive-element-interactions` | `a11y/no-noninteractive-element-interactions` | recommended, strict | ✅ Available |
| `jsx-a11y/no-noninteractive-element-to-interactive-role` | `a11y/no-noninteractive-element-to-interactive-role` | recommended, strict | ✅ Available |
| `jsx-a11y/no-noninteractive-tabindex` | `a11y/no-noninteractive-tabindex` | recommended, strict | ✅ Available |
| `jsx-a11y/no-redundant-roles` | `a11y/no-redundant-roles` | recommended, strict | ✅ Available |
| `jsx-a11y/no-static-element-interactions` | `a11y/no-static-element-interactions` | recommended, strict | ✅ Available |
| `jsx-a11y/role-has-required-aria-props` | `a11y/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/role-supports-aria-props` | `a11y/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/scope` | `a11y/scope` | recommended, strict | ✅ Available; see also `table-structure` |
| `jsx-a11y/tabindex-no-positive` | `a11y/tabindex-no-positive` | recommended, strict | ✅ Available |

**Legend:**
- ✅ All listed jsx-a11y rules have a corresponding a11y rule or are covered by a combined rule (e.g. aria-validation). Use the Config Preset column to see which preset includes each rule.

## Step-by-Step Migration

### Step 1: Install a11y

```bash
npm uninstall eslint-plugin-jsx-a11y
npm install --save-dev eslint-plugin-a11y
```

### Step 2: Update ESLint Configuration

#### Classic Config (.eslintrc.js)

**Before (jsx-a11y):**
```javascript
module.exports = {
  extends: ['plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y']
}
```

**After (a11y):**
```javascript
module.exports = {
  extends: ['plugin:a11y/recommended'],
  plugins: ['a11y']
}
```

#### Flat Config (eslint.config.js)

**Before (jsx-a11y):**
```javascript
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  jsxA11y.configs.recommended
]
```

**After (a11y):**
```javascript
import testA11yJs from 'eslint-plugin-a11y'

export default [
  {
    plugins: {
      'a11y': testA11yJs
    },
    ...testA11yJs.configs['flat/recommended']
  }
]
```

### Step 3: Map Your Rules

Update rule names in your config:

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:a11y/recommended'],
  plugins: ['a11y'],
  rules: {
    // Map jsx-a11y rules to a11y
    'a11y/image-alt': 'error',        // was: jsx-a11y/alt-text
    'a11y/link-text': 'warn',         // was: jsx-a11y/anchor-is-valid
    'a11y/form-label': 'error',       // was: jsx-a11y/label-has-associated-control
    'a11y/iframe-title': 'error',    // was: jsx-a11y/iframe-has-title
    'a11y/heading-order': 'warn',    // was: jsx-a11y/heading-has-content
    'a11y/table-structure': 'error'   // was: jsx-a11y/scope
  }
}
```

### Step 4: Add Component Mapping (If Needed)

If you use design-system components, add component mapping:

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:a11y/recommended'],
  plugins: ['a11y'],
  settings: {
    'a11y': {
      components: {
        Link: 'a',
        Button: 'button',
        Image: 'img'
      },
      polymorphicPropNames: ['as', 'component']
    }
  }
}
```

### Step 5: Optional and Strict-Only Rules

All jsx-a11y rules listed above are implemented in a11y. Some are only in the **strict** preset (e.g. `aria-validation`, `img-redundant-alt`, `mouse-events-have-key-events`). For runtime-only checks (e.g. focus traps, keyboard navigation), use the `A11yChecker` programmatic API; see [Integration Guide](./INTEGRATION.md).

## Compatibility Bridge Preset

For a smoother transition, you can use both plugins temporarily:

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:a11y/recommended',
    'plugin:jsx-a11y/recommended' // Keep for missing rules
  ],
  plugins: ['a11y', 'jsx-a11y'],
  rules: {
    // Disable jsx-a11y rules that a11y covers
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/iframe-has-title': 'off',
    'jsx-a11y/heading-has-content': 'off',
    'jsx-a11y/scope': 'off'
  }
}
```

## Feature Comparison

| Feature | jsx-a11y | a11y |
|---------|----------|--------------|
| React support | ✅ | ✅ |
| Vue support | ❌ | ✅ |
| Component mapping | ⚠️ Limited | ✅ Full support |
| Polymorphic components | ❌ | ✅ |
| Rule options | ⚠️ Limited | ✅ Extensive |
| Flat config | ⚠️ Partial | ✅ Full support |
| Programmatic API | ❌ | ✅ A11yChecker |
| Bundle size | Larger | 35KB |

## Common Migration Issues

### Issue: "Rules not working"

**Solution:** Ensure you've updated both `extends` and `plugins`:

```javascript
// ✅ Correct
{
  extends: ['plugin:a11y/recommended'],
  plugins: ['a11y']
}

// ❌ Wrong - missing plugin
{
  extends: ['plugin:a11y/recommended']
}
```

### Issue: "Component rules not applying"

**Solution:** Add component mapping in settings:

```javascript
{
  settings: {
    'a11y': {
      components: { Link: 'a', Button: 'button' }
    }
  }
}
```

### Issue: "Different error messages"

**Solution:** a11y uses different message IDs. Update your CI/CD or tooling that parses ESLint output.

## Next Steps

1. ✅ Complete migration to a11y
2. ✅ Enable ARIA rules: `a11y/aria-validation`, `a11y/semantic-html`, `a11y/form-validation`
3. 📚 Read [Configuration Guide](./CONFIGURATION.md) for advanced options
4. 🧪 Set up A11yChecker for runtime testing (see [Integration Guide](./INTEGRATION.md))
5. 🔗 Use runtime comment convention for static + runtime workflow (see [ESLint Plugin Guide](./ESLINT_PLUGIN.md#static--runtime-workflow))

## Need Help?

- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Configuration Guide](./CONFIGURATION.md)
- Open an issue on GitHub
