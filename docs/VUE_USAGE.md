# Vue Support

The `a11y` ESLint plugin supports Vue Single File Components (SFC) when using `vue-eslint-parser`.

## Installation

Install `vue-eslint-parser` as a peer dependency:

```bash
npm install --save-dev vue-eslint-parser
```

## Configuration

Configure ESLint to use `vue-eslint-parser` for `.vue` files:

```javascript
// .eslintrc.js
module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser', // or 'babel-eslint'
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['a11y'],
  extends: ['plugin:a11y/recommended']
}
```

## Supported Vue Syntax

The plugin supports:

- **Regular attributes**: `<img src="test.jpg" alt="Test" />`
- **v-bind syntax**: `<img :src="imageUrl" :alt="altText" />`
- **Shorthand v-bind**: `<img :alt="altText" />`
- **Dynamic attributes**: Warns when attributes are dynamic

## Examples

### Image Alt Attribute

```vue
<template>
  <!-- ❌ Missing alt -->
  <img src="photo.jpg" />
  
  <!-- ❌ Empty alt -->
  <img src="photo.jpg" alt="" />
  
  <!-- ✅ Valid -->
  <img src="photo.jpg" alt="A beautiful landscape" />
  
  <!-- ⚠️ Dynamic alt (warning) -->
  <img :src="imageUrl" :alt="dynamicAlt" />
</template>
```

### Button Labels

```vue
<template>
  <!-- ❌ Missing label -->
  <button></button>
  
  <!-- ✅ Valid with text -->
  <button>Click me</button>
  
  <!-- ✅ Valid with aria-label -->
  <button aria-label="Close menu"></button>
  
  <!-- ⚠️ Dynamic label (warning) -->
  <button :aria-label="dynamicLabel"></button>
</template>
```

### Link Text

```vue
<template>
  <!-- ❌ Missing text -->
  <a href="/about"></a>
  
  <!-- ⚠️ Non-descriptive text -->
  <a href="/about">Click here</a>
  
  <!-- ✅ Valid -->
  <a href="/about">About Us</a>
  
  <!-- ✅ Valid with aria-label -->
  <a href="/about" aria-label="Learn more about us">Read more</a>
</template>
```

### Form Labels

```vue
<template>
  <!-- ❌ Missing label -->
  <input type="text" />
  
  <!-- ✅ Valid with id/for -->
  <label for="name">Name</label>
  <input id="name" type="text" />
  
  <!-- ✅ Valid with aria-label -->
  <input type="email" aria-label="Email address" />
  
  <!-- ✅ Valid with aria-labelledby -->
  <span id="email-label">Email</span>
  <input type="email" aria-labelledby="email-label" />
</template>
```

### Heading Order

```vue
<template>
  <!-- ✅ Valid hierarchy -->
  <h1>Title</h1>
  <h2>Subtitle</h2>
  <h3>Section</h3>
  
  <!-- ⚠️ Skipped level (warning) -->
  <h1>Title</h1>
  <h3>Section</h3> <!-- Skipped h2 -->
</template>
```

## Vue-Specific Features

### Dynamic Attributes

The plugin detects dynamic attributes (using `v-bind` or `:`) and warns about them:

```vue
<template>
  <!-- Warning: alt is dynamic -->
  <img :src="imageUrl" :alt="altText" />
</template>
```

This is a warning (not an error) because the plugin cannot statically verify that the dynamic value is not empty.

### v-bind Syntax

Both `v-bind:attr` and `:attr` syntaxes are supported:

```vue
<template>
  <!-- Both are equivalent -->
  <img v-bind:alt="altText" />
  <img :alt="altText" />
</template>
```

## Limitations

1. **Dynamic Content**: The plugin cannot verify dynamic attribute values at lint time. It will warn but not error.

2. **Computed Properties**: Vue computed properties and methods are not evaluated.

3. **v-if/v-show**: Conditional rendering is not analyzed - the plugin checks all branches.

4. **Slots**: Slot content is not checked (only the template itself).

## Troubleshooting

### Plugin not working with Vue files

1. Ensure `vue-eslint-parser` is installed
2. Verify your ESLint config uses `vue-eslint-parser` as the parser
3. Check that `.vue` files are included in your ESLint configuration

### False positives with dynamic attributes

If you're getting warnings for dynamic attributes that you know are safe, you can:
- Use `eslint-disable-next-line` comments
- Configure the rule severity in your ESLint config
- Ensure the dynamic value is always set (runtime check)

## Migration from JSX

If you're migrating from React/JSX to Vue:

- JSX: `<img alt={altText} />` → Vue: `<img :alt="altText" />`
- JSX: `<button aria-label={label} />` → Vue: `<button :aria-label="label" />`
- Most other patterns are similar

