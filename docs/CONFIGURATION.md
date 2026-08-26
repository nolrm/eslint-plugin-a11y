# ESLint Plugin Configuration

The `a11y` ESLint plugin provides several configuration presets to suit different project needs.

## Available Configurations

### Minimal

The minimal configuration enables only the most critical accessibility rules. Use this for:
- Large projects starting accessibility checks
- Incremental adoption
- Performance-sensitive environments

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/minimal']
}
```

**Rule Severity:**
- `button-label`: error (critical impact)
- `form-label`: error (critical impact)
- `image-alt`: error (serious impact)

**When to use:**
- Starting accessibility checks in large codebase
- Need fast ESLint execution
- Want to focus on critical violations first

See [Large Project Setup Guide](./LARGE_PROJECTS.md) for detailed instructions.

### Recommended (Default)

The recommended configuration uses a balanced approach with critical violations as errors and moderate violations as warnings.

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended']
}
```

**Rule Severity:**
- `image-alt`: error (serious impact)
- `button-label`: error (critical impact)
- `form-label`: error (critical impact)
- `link-text`: warn (moderate impact)
- `heading-order`: warn (moderate impact)

### Strict

The strict configuration treats all violations as errors for maximum enforcement.

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/strict']
}
```

**Rule Severity:**
- All rules: `error`

Use this configuration when you want to enforce strict accessibility standards and catch all violations immediately.

### React

Optimized configuration for React/JSX projects.

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['a11y'],
  extends: ['plugin:a11y/react']
}
```

**Features:**
- Pre-configured for JSX parsing
- Same rule severity as recommended
- Optimized for React component patterns

### Vue

Optimized configuration for Vue projects using vue-eslint-parser.

```javascript
// .eslintrc.js
module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['a11y'],
  extends: ['plugin:a11y/vue']
}
```

**Features:**
- Pre-configured for Vue SFC templates
- Same rule severity as recommended
- Optimized for Vue template syntax

**Note:** Requires `vue-eslint-parser` to be installed.

## Custom Configuration

You can also configure rules individually:

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
    'a11y/heading-order': 'off',
    
    // Use rule with options
    'a11y/image-alt': ['error', {
      allowMissingAltOnDecorative: true,
      decorativeMatcher: {
        markerAttributes: ['data-decorative']
      }
    }],
    'a11y/link-text': ['warn', {
      denylist: ['click here', 'read more'],
      caseInsensitive: true
    }],
    'a11y/heading-order': ['warn', {
      allowSameLevel: true,
      maxSkip: 2
    }]
  }
}
```

## Rule Options

### image-alt Options

Configure how decorative images are handled:

```javascript
{
  'a11y/image-alt': ['error', {
    allowMissingAltOnDecorative: false, // default: false (strict by default)
    decorativeMatcher: {
      requireAriaHidden: false,        // Require aria-hidden="true"
      requireRolePresentation: false,  // Require role="presentation"
      markerAttributes: []             // Custom attributes like ['data-decorative']
    }
  }]
}
```

**Examples:**

```jsx
// Default behavior (strict) - requires alt
<img src="photo.jpg" /> // ❌ Error: missing alt

// With allowMissingAltOnDecorative: true
<img src="decorative.jpg" aria-hidden="true" /> // ✅ Allowed
<img src="decorative.jpg" role="presentation" /> // ✅ Allowed
<img src="decorative.jpg" data-decorative="true" /> // ✅ Allowed (with markerAttributes)

// Empty alt without decorative markers
<img src="photo.jpg" alt="" /> // ❌ Error: emptyAltNotDecorative
```

### link-text Options

Configure denylist and matching behavior:

```javascript
{
  'a11y/link-text': ['warn', {
    denylist: ['click here', 'read more', 'more'], // default
    caseInsensitive: true,                          // default: true
    allowlistPatterns: []                           // Regex patterns to allow
  }]
}
```

**Examples:**

```jsx
// Default denylist
<a href="/about">Click here</a> // ⚠️ Warning: nonDescriptive

// Custom denylist
{
  'a11y/link-text': ['warn', {
    denylist: ['learn more', 'discover']
  }]
}

// Case sensitive matching
{
  'a11y/link-text': ['warn', {
    caseInsensitive: false
  }]
}
// <a href="/about">CLICK HERE</a> // ✅ Passes (case sensitive)
// <a href="/about">click here</a> // ⚠️ Warning

// Checks multiple accessible name sources
<a href="/about" aria-label="About our company">Click here</a> // ✅ Passes (aria-label checked)
<a href="/about" aria-labelledby="link-label">Click here</a> // ✅ Passes (aria-labelledby checked)
```

### heading-order Options

Configure heading hierarchy tolerance:

```javascript
{
  'a11y/heading-order': ['warn', {
    allowSameLevel: true,  // default: true
    maxSkip: undefined     // Allow skips up to this level (e.g., 2 allows h1→h3)
  }]
}
```

**Examples:**

```jsx
// Default: allows same level
<h2>First</h2><h2>Second</h2> // ✅ Passes

// Allow larger skips
{
  'a11y/heading-order': ['warn', {
    maxSkip: 2  // Allows skipping up to 2 levels
  }]
}
// <h1>Title</h1><h3>Section</h3> // ✅ Passes (skip of 2)
// <h1>Title</h1><h4>Subsection</h4> // ⚠️ Warning (skip of 3 > maxSkip)
```

### anchor-is-valid Options

Configure alternate href-equivalent props and which checks are active:

```javascript
{
  'a11y/anchor-is-valid': ['error', {
    specialLink: [],                                    // default: [] - extra prop/attribute names checked as href aliases
    aspects: ['noHref', 'invalidHref', 'preferButton']   // default: all three
  }]
}
```

**`specialLink`** lets a mapped Link component (see [Component Mapping](#component-mapping--polymorphic-support) below) use a different prop name for its URL, e.g. React Router's `to`:

```javascript
// eslint config
{
  settings: {
    'a11y': { components: { Link: 'a' } }
  },
  rules: {
    'a11y/anchor-is-valid': ['error', { specialLink: ['to'] }]
  }
}
```

```jsx
<Link to="/home">Home</Link>       // ✅ Passes (to recognized as href-equivalent)
<Link to="#">Home</Link>           // ❌ invalidHref
<Link>Home</Link>                 // ❌ missingHref
```

**`aspects`** toggles individual checks on or off. For example, to only validate href values without requiring href to be present at all:

```javascript
{
  'a11y/anchor-is-valid': ['error', {
    aspects: ['invalidHref']  // disables noHref and preferButton checks
  }]
}
```

```jsx
<a>No link</a>                     // ✅ Passes (noHref check disabled)
<a href="#">Bad link</a>           // ❌ invalidHref (still enabled)
```

## Component Mapping & Polymorphic Support

Map your design-system components to native HTML elements so rules apply correctly.

### Basic Component Mapping

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  settings: {
    'a11y': {
      components: {
        Link: 'a',        // Treat <Link> as <a>
        Button: 'button', // Treat <Button> as <button>
        Image: 'img'      // Treat <Image> as <img>
      }
    }
  }
}
```

**Example:**

```jsx
// Without mapping - rules don't apply
<Link href="/about">Click here</Link> // No warning

// With mapping - rules apply
// .eslintrc.js settings: { 'a11y': { components: { Link: 'a' } } }
<Link href="/about">Click here</Link> // ⚠️ Warning: nonDescriptive
```

### Polymorphic Components

Support components that accept an `as` or `component` prop:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  settings: {
    'a11y': {
      polymorphicPropNames: ['as', 'component'] // Default: ['as', 'component']
    }
  }
}
```

**Example:**

```jsx
// Polymorphic component
<Link as="a" href="/about">About Us</Link>     // ✅ Treated as <a>
<Link as="button" onClick={handleClick}>Click</Link> // ✅ Treated as <button>

// Dynamic polymorphic (not checked statically)
<Link as={component} href="/about">About</Link> // ✅ No error (dynamic)
```

### Resolution Precedence

Component resolution follows this order (highest to lowest priority):

1. **Native HTML tag** - `<a>`, `<button>`, `<img>` always win
2. **Polymorphic prop** - `as="a"` or `component="button"` (when static literal)
3. **Settings mapping** - `components: { Link: 'a' }`
4. **Unknown** - Component not recognized

**Note:** step 1 matches case-insensitively against the JSX identifier itself, before any
settings are consulted. A component literally named `Button`, `Nav`, `Header`, `Table`,
`H1`-`H6`, etc. is treated as that native element automatically - **no `components`
mapping is required**. This is convenient for conventionally-named design-system
components, but it means rules like `button-label` (see below) apply to them
out of the box too, so it's worth knowing about even if you never touch `settings`.

### Label Prop Support

`button-label` recognizes an accessible name from JSX/attribute children or
`aria-label`/`aria-labelledby` on native `<button>` elements. Custom button components
(matched via the case-insensitive name rule above, or via `components` mapping) often
carry their accessible name through a different prop instead, e.g.:

```jsx
<Button label="Cancel" />
```

By default, `button-label` also checks a `label` prop on non-native button-like
components - **no configuration needed** for this common convention. If your design
system uses a different prop name, configure it:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  settings: {
    'a11y': {
      labelPropNames: ['text'] // Default: ['label']
    }
  }
}
```

**Behavior:**

- A static string value (`label="Cancel"`) counts as a valid accessible name.
- A dynamic value (`label={cancelLabel}`) can't be verified as non-empty at lint time,
  so it's reported as `dynamicLabel` (not `missingLabel`) - the same treatment already
  given to a dynamic `aria-label`. Suppress it with an
  [`a11y-checked-at-runtime`](./ESLINT_PLUGIN.md) comment once you've verified it.
- An empty string (`label=""`) or a missing prop still reports `missingLabel`.
- This only applies to non-native components - a literal `<button>` element's behavior
  is unchanged (children/`aria-label`/`aria-labelledby` only).
- Vue custom-component mapping isn't implemented yet (see Resolution Precedence above -
  it's JSX-only today), so `labelPropNames` currently has no effect on `VElement` nodes.

## Flat Config (ESLint v9+)

For ESLint v9+, use flat config format with our presets:

### Basic Setup

```javascript
// eslint.config.js
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

### React Setup

```javascript
// eslint.config.js
import testA11yJs from 'eslint-plugin-a11y'

export default [
  {
    plugins: {
      'a11y': testA11yJs
    },
    ...testA11yJs.configs['flat/react']
  }
]
```

### Vue Setup

```javascript
// eslint.config.js
import testA11yJs from 'eslint-plugin-a11y'

export default [
  {
    plugins: {
      'a11y': testA11yJs
    },
    ...testA11yJs.configs['flat/vue']
  }
]
```

### Available Flat Config Presets

- `flat/recommended` - Rules only (minimal assumptions, add your own parser)
- `flat/recommended-react` - Rules + React parser options (convenience)
- `flat/react` - Full React setup
- `flat/vue` - Full Vue setup
- `flat/minimal` - Minimal rules only
- `flat/strict` - All rules as errors

### With Component Mapping

```javascript
// eslint.config.js
import testA11yJs from 'eslint-plugin-a11y'

export default [
  {
    plugins: {
      'a11y': testA11yJs
    },
    ...testA11yJs.configs['flat/recommended'],
    settings: {
      'a11y': {
        components: {
          Link: 'a',
          Button: 'button'
        },
        polymorphicPropNames: ['as']
      }
    }
  }
]
```

## Rule Severity Levels

Rules are categorized by impact level:

### Critical (Error by default)
- **button-label**: Buttons without labels prevent screen reader users from understanding functionality
- **form-label**: Form controls without labels prevent users from understanding what to input

### Serious (Error by default)
- **image-alt**: Images without alt text prevent screen reader users from understanding content

### Moderate (Warning by default)
- **link-text**: Non-descriptive link text makes navigation difficult for screen reader users
- **heading-order**: Skipped heading levels make document structure unclear

## Framework-Specific Setup

### React/JSX

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['a11y'],
  extends: ['plugin:a11y/react']
}
```

### Vue

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

### TypeScript

Works with both React and Vue:

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['a11y', '@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:a11y/recommended'
  ]
}
```

## Migration Guide

### From Recommended to Strict

If you want to upgrade from recommended to strict:

```javascript
// Before
extends: ['plugin:a11y/recommended']

// After
extends: ['plugin:a11y/strict']
```

This will change `link-text` and `heading-order` from warnings to errors.

### From React to Vue

If migrating a React project to Vue:

```javascript
// Before (React)
parser: '@typescript-eslint/parser',
extends: ['plugin:a11y/react']

// After (Vue)
parser: 'vue-eslint-parser',
extends: ['plugin:a11y/vue']
```

## Best Practices

1. **Start with Recommended**: Use the recommended configuration as a starting point
2. **Gradually Increase Strictness**: Move to strict configuration once your codebase is mostly compliant
3. **Framework-Specific Configs**: Use React or Vue configs for better integration
4. **Custom Overrides**: Override specific rules based on your project's needs
5. **CI/CD Integration**: Use strict configuration in CI/CD to catch violations early

## Ignore Patterns for Large Projects

For large codebases, you may want to exclude certain files or directories from accessibility checks.

### Using ESLint ignorePatterns

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  ignorePatterns: [
    // Exclude build outputs
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/out/**',
    
    // Exclude dependencies
    '**/node_modules/**',
    
    // Exclude test files (optional)
    '**/*.test.{js,ts,jsx,tsx}',
    '**/*.spec.{js,ts,jsx,tsx}',
    
    // Exclude generated files
    '**/*.generated.{js,ts}',
    '**/generated/**',
    
    // Exclude legacy code (temporary)
    '**/legacy/**',
    '**/old/**'
  ]
}
```

### Using .eslintignore file

Create a `.eslintignore` file in your project root:

```
# Build outputs
dist/
build/
.next/
out/

# Dependencies
node_modules/

# Test files (optional)
**/*.test.{js,ts,jsx,tsx}
**/*.spec.{js,ts,jsx,tsx}

# Legacy code
legacy/
old/
```

### File-specific rule disabling

For specific files that need exceptions:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  overrides: [
    {
      files: ['**/*.test.{js,ts,jsx,tsx}'],
      rules: {
        'a11y/**': 'off' // Disable all a11y rules in tests
      }
    },
    {
      files: ['**/legacy/**'],
      rules: {
        'a11y/**': 'warn' // Only warnings in legacy code
      }
    }
  ]
}
```

### Relaxing interaction rules in stories and tests

Rules like `click-events-have-key-events` check every `onClick` handler, including ones
in Storybook stories and test files where the handler is test/demo plumbing rather than
a real interactive control. This rule has no file-path awareness by design (matching
`eslint-plugin-jsx-a11y`'s equivalent rules) - scoping it is a config concern, not
something the rule itself should guess at. Rather than disabling all `a11y/*` rules in
those files (which also hides real issues, e.g. in a story that's meant to demonstrate
accessible usage), relax just the interaction-heavy rules:

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended'],
  overrides: [
    {
      files: ['**/*.stories.{js,ts,jsx,tsx}', '**/*.test.{js,ts,jsx,tsx}'],
      rules: {
        'a11y/click-events-have-key-events': 'off',
        'a11y/mouse-events-have-key-events': 'off'
      }
    }
  ]
}
```

If you're evaluating this plugin against a baseline (e.g. `eslint-plugin-jsx-a11y`) that
already has this kind of override in place, add the equivalent override before comparing
violation counts - otherwise the comparison counts noise that the baseline configuration
was already filtering out.

## Troubleshooting

### Rules not working

1. Ensure the plugin is installed: `npm install eslint-plugin-a11y`
2. Verify the plugin is in your ESLint config
3. Check that your parser supports JSX (for React) or Vue (for Vue)
4. Ensure file extensions are included in ESLint's file patterns

### Too many errors

If you're getting too many violations:
1. Start with minimal configuration (only 3 critical rules)
2. Fix violations incrementally
3. Use `eslint-disable` comments for exceptions
4. Gradually move to recommended, then strict configuration

### Vue rules not working

1. Ensure `vue-eslint-parser` is installed
2. Verify your ESLint config uses `vue-eslint-parser` as the parser
3. Check that `.vue` files are included in ESLint's file patterns

