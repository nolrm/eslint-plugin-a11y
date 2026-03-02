# Migration Guide: From eslint-plugin-jsx-a11y to test-a11y-js

This guide helps you migrate from `eslint-plugin-jsx-a11y` to `eslint-plugin-test-a11y-js`.

## Why Migrate?

- ✅ **Zero config** - Works out of the box
- ✅ **Vue support** - Full Vue SFC support (jsx-a11y is React-only)
- ✅ **Component mapping** - Built-in support for design-system components
- ✅ **Flat config ready** - ESLint v9+ support
- ✅ **Dual API** - ESLint plugin + programmatic A11yChecker API
- ✅ **Smaller bundle** - 35KB vs larger jsx-a11y bundle

## Rule Mapping

Audited against `src/linter/eslint-plugin/index.ts` (43 rules). Config Preset indicates which 1.0 presets include the rule: **minimal** (3 rules), **recommended** (30 rules), **strict** (43 rules).

| jsx-a11y Rule | test-a11y-js Rule | Config Preset | Notes |
|---------------|-------------------|---------------|-------|
| `jsx-a11y/alt-text` | `test-a11y-js/image-alt` | minimal, recommended, strict | Enhanced with decorative image options |
| `jsx-a11y/anchor-is-valid` | `test-a11y-js/anchor-is-valid` | recommended, strict | Href/link validation; see also `link-text` for descriptive text |
| `jsx-a11y/aria-activedescendant-has-tabindex` | `test-a11y-js/aria-activedescendant-has-tabindex` | recommended, strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-props` | `test-a11y-js/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-proptypes` | `test-a11y-js/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-role` | `test-a11y-js/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/aria-unsupported-elements` | `test-a11y-js/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/click-events-have-key-events` | `test-a11y-js/click-events-have-key-events` | recommended, strict | ✅ Available |
| `jsx-a11y/heading-has-content` | `test-a11y-js/heading-has-content` | recommended, strict | ✅ Available; see also `heading-order` for hierarchy |
| `jsx-a11y/html-has-lang` | `test-a11y-js/html-has-lang` | recommended, strict | ✅ Available (contextual: &lt;html&gt; in scope) |
| `jsx-a11y/iframe-has-title` | `test-a11y-js/iframe-title` | recommended, strict | ✅ Available |
| `jsx-a11y/img-redundant-alt` | `test-a11y-js/img-redundant-alt` | strict | ✅ Available (dedicated rule) |
| `jsx-a11y/interactive-supports-focus` | `test-a11y-js/interactive-supports-focus` | recommended, strict | ✅ Available |
| `jsx-a11y/label-has-associated-control` | `test-a11y-js/form-label` | minimal, recommended, strict | ✅ Available |
| `jsx-a11y/media-has-caption` | `test-a11y-js/video-captions`, `test-a11y-js/audio-captions` | recommended, strict | ✅ Available |
| `jsx-a11y/mouse-events-have-key-events` | `test-a11y-js/mouse-events-have-key-events` | strict | ✅ Available |
| `jsx-a11y/no-access-key` | `test-a11y-js/no-access-key` | recommended, strict | ✅ Available |
| `jsx-a11y/no-autofocus` | `test-a11y-js/no-autofocus` | recommended, strict | ✅ Available |
| `jsx-a11y/no-distracting-elements` | `test-a11y-js/no-distracting-elements` | recommended, strict | ✅ Available |
| `jsx-a11y/no-interactive-element-to-noninteractive-role` | `test-a11y-js/no-interactive-element-to-noninteractive-role` | recommended, strict | ✅ Available |
| `jsx-a11y/no-noninteractive-element-interactions` | `test-a11y-js/no-noninteractive-element-interactions` | recommended, strict | ✅ Available |
| `jsx-a11y/no-noninteractive-element-to-interactive-role` | `test-a11y-js/no-noninteractive-element-to-interactive-role` | recommended, strict | ✅ Available |
| `jsx-a11y/no-noninteractive-tabindex` | `test-a11y-js/no-noninteractive-tabindex` | recommended, strict | ✅ Available |
| `jsx-a11y/no-redundant-roles` | `test-a11y-js/no-redundant-roles` | recommended, strict | ✅ Available |
| `jsx-a11y/no-static-element-interactions` | `test-a11y-js/no-static-element-interactions` | recommended, strict | ✅ Available |
| `jsx-a11y/role-has-required-aria-props` | `test-a11y-js/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/role-supports-aria-props` | `test-a11y-js/aria-validation` | strict | ✅ Available (AST-based) |
| `jsx-a11y/scope` | `test-a11y-js/scope` | recommended, strict | ✅ Available; see also `table-structure` |
| `jsx-a11y/tabindex-no-positive` | `test-a11y-js/tabindex-no-positive` | recommended, strict | ✅ Available |

**Legend:**
- ✅ All listed jsx-a11y rules have a corresponding test-a11y-js rule or are covered by a combined rule (e.g. aria-validation). Use the Config Preset column to see which preset includes each rule.

## Step-by-Step Migration

### Step 1: Install test-a11y-js

```bash
npm uninstall eslint-plugin-jsx-a11y
npm install --save-dev eslint-plugin-test-a11y-js
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

**After (test-a11y-js):**
```javascript
module.exports = {
  extends: ['plugin:test-a11y-js/recommended'],
  plugins: ['test-a11y-js']
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

**After (test-a11y-js):**
```javascript
import testA11yJs from 'eslint-plugin-test-a11y-js'

export default [
  {
    plugins: {
      'test-a11y-js': testA11yJs
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
  extends: ['plugin:test-a11y-js/recommended'],
  plugins: ['test-a11y-js'],
  rules: {
    // Map jsx-a11y rules to test-a11y-js
    'test-a11y-js/image-alt': 'error',        // was: jsx-a11y/alt-text
    'test-a11y-js/link-text': 'warn',         // was: jsx-a11y/anchor-is-valid
    'test-a11y-js/form-label': 'error',       // was: jsx-a11y/label-has-associated-control
    'test-a11y-js/iframe-title': 'error',    // was: jsx-a11y/iframe-has-title
    'test-a11y-js/heading-order': 'warn',    // was: jsx-a11y/heading-has-content
    'test-a11y-js/table-structure': 'error'   // was: jsx-a11y/scope
  }
}
```

### Step 4: Add Component Mapping (If Needed)

If you use design-system components, add component mapping:

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:test-a11y-js/recommended'],
  plugins: ['test-a11y-js'],
  settings: {
    'test-a11y-js': {
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

All jsx-a11y rules listed above are implemented in test-a11y-js. Some are only in the **strict** preset (e.g. `aria-validation`, `img-redundant-alt`, `mouse-events-have-key-events`). For runtime-only checks (e.g. focus traps, keyboard navigation), use the `A11yChecker` programmatic API; see [Integration Guide](./INTEGRATION.md).

## Compatibility Bridge Preset

For a smoother transition, you can use both plugins temporarily:

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:test-a11y-js/recommended',
    'plugin:jsx-a11y/recommended' // Keep for missing rules
  ],
  plugins: ['test-a11y-js', 'jsx-a11y'],
  rules: {
    // Disable jsx-a11y rules that test-a11y-js covers
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

| Feature | jsx-a11y | test-a11y-js |
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
  extends: ['plugin:test-a11y-js/recommended'],
  plugins: ['test-a11y-js']
}

// ❌ Wrong - missing plugin
{
  extends: ['plugin:test-a11y-js/recommended']
}
```

### Issue: "Component rules not applying"

**Solution:** Add component mapping in settings:

```javascript
{
  settings: {
    'test-a11y-js': {
      components: { Link: 'a', Button: 'button' }
    }
  }
}
```

### Issue: "Different error messages"

**Solution:** test-a11y-js uses different message IDs. Update your CI/CD or tooling that parses ESLint output.

## Next Steps

1. ✅ Complete migration to test-a11y-js
2. ✅ Enable ARIA rules: `test-a11y-js/aria-validation`, `test-a11y-js/semantic-html`, `test-a11y-js/form-validation`
3. 📚 Read [Configuration Guide](./CONFIGURATION.md) for advanced options
4. 🧪 Set up A11yChecker for runtime testing (see [Integration Guide](./INTEGRATION.md))
5. 🔗 Use runtime comment convention for static + runtime workflow (see [ESLint Plugin Guide](./ESLINT_PLUGIN.md#static--runtime-workflow))

## Need Help?

- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Configuration Guide](./CONFIGURATION.md)
- Open an issue on GitHub
