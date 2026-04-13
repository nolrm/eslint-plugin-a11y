# Examples

Real-world examples of using the `a11y` ESLint plugin.

## Table of Contents

- [React Examples](#react-examples)
- [Vue Examples](#vue-examples)
- [TypeScript Examples](#typescript-examples)
- [Common Patterns](#common-patterns)
- [Edge Cases](#edge-cases)

## React Examples

### Basic Component

```tsx
// ❌ Violations
function ArticleCard() {
  return (
    <article>
      <img src="article.jpg" />
      <h2>Article Title</h2>
      <p>Article content...</p>
      <a href="/read-more">Read more</a>
      <button></button>
    </article>
  )
}

// ✅ Fixed
function ArticleCard() {
  return (
    <article>
      <img src="article.jpg" alt="Article illustration" />
      <h2>Article Title</h2>
      <p>Article content...</p>
      <a href="/read-more">Read full article</a>
      <button aria-label="Share article">Share</button>
    </article>
  )
}
```

### Form Component

```tsx
// ❌ Violations
function ContactForm() {
  return (
    <form>
      <input type="text" />
      <input type="email" />
      <textarea></textarea>
      <button>Submit</button>
    </form>
  )
}

// ✅ Fixed
function ContactForm() {
  return (
    <form>
      <label htmlFor="name">Name</label>
      <input id="name" type="text" />
      
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      
      <label htmlFor="message">Message</label>
      <textarea id="message"></textarea>
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Navigation Component

```tsx
// ❌ Violations
function Navigation() {
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/about">Click here</a>
      <a href="/contact">More</a>
      <button></button>
    </nav>
  )
}

// ✅ Fixed
function Navigation() {
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/about">About Us</a>
      <a href="/contact">Contact Us</a>
      <button aria-label="Toggle menu">☰</button>
    </nav>
  )
}
```

### Image Gallery

```tsx
// ❌ Violations
function ImageGallery({ images }) {
  return (
    <div>
      {images.map(img => (
        <img key={img.id} src={img.url} />
      ))}
    </div>
  )
}

// ✅ Fixed
function ImageGallery({ images }) {
  return (
    <div>
      {images.map(img => (
        <img 
          key={img.id} 
          src={img.url} 
          alt={img.description || `Gallery image ${img.id}`}
        />
      ))}
    </div>
  )
}
```

## Vue Examples

### Basic Component

```vue
<!-- ❌ Violations -->
<template>
  <div class="card">
    <img src="card.jpg" />
    <h2>Card Title</h2>
    <p>Card content...</p>
    <a href="/details">Read more</a>
    <button></button>
  </div>
</template>

<!-- ✅ Fixed -->
<template>
  <div class="card">
    <img src="card.jpg" alt="Card illustration" />
    <h2>Card Title</h2>
    <p>Card content...</p>
    <a href="/details">Read full details</a>
    <button aria-label="Close card">×</button>
  </div>
</template>
```

### Form Component

```vue
<!-- ❌ Violations -->
<template>
  <form @submit="handleSubmit">
    <input type="text" v-model="name" />
    <input type="email" v-model="email" />
    <textarea v-model="message"></textarea>
    <button type="submit">Submit</button>
  </form>
</template>

<!-- ✅ Fixed -->
<template>
  <form @submit="handleSubmit">
    <label for="name">Name</label>
    <input id="name" type="text" v-model="name" />
    
    <label for="email">Email</label>
    <input id="email" type="email" v-model="email" />
    
    <label for="message">Message</label>
    <textarea id="message" v-model="message"></textarea>
    
    <button type="submit">Submit</button>
  </form>
</template>
```

### Dynamic Attributes

```vue
<!-- ⚠️ Dynamic attributes (warnings) -->
<template>
  <img :src="imageUrl" :alt="altText" />
  <button :aria-label="buttonLabel"></button>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: 'photo.jpg',
      altText: 'Photo description', // Always set
      buttonLabel: 'Close' // Always set
    }
  }
}
</script>
```

### Conditional Rendering

```vue
<!-- ✅ Proper handling of conditional content -->
<template>
  <div>
    <img 
      v-if="imageUrl" 
      :src="imageUrl" 
      :alt="imageAlt || 'Default description'"
    />
    <button 
      v-if="showButton"
      :aria-label="buttonLabel || 'Button'"
    >
      {{ buttonText }}
    </button>
  </div>
</template>
```

## TypeScript Examples

### React with TypeScript

```tsx
// ✅ TypeScript component
interface ImageProps {
  src: string
  alt: string
}

function Image({ src, alt }: ImageProps) {
  return <img src={src} alt={alt} />
}

// ✅ Generic component
interface ButtonProps {
  label: string
  onClick: () => void
}

function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} aria-label={label}>
      {label}
    </button>
  )
}
```

### Vue with TypeScript

```vue
<template>
  <img :src="image.src" :alt="image.alt" />
  <button :aria-label="buttonLabel" @click="handleClick">
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
interface Image {
  src: string
  alt: string
}

const image: Image = {
  src: 'photo.jpg',
  alt: 'Photo description'
}

const buttonLabel = 'Close menu'
const buttonText = '×'

function handleClick() {
  // Handle click
}
</script>
```

## Common Patterns

### Icon Buttons

```tsx
// ✅ Icon-only buttons
<button aria-label="Close dialog">
  <CloseIcon />
</button>

<button aria-label="Search">
  <SearchIcon />
</button>

<button aria-label="Delete item">
  <DeleteIcon />
</button>
```

### Decorative Images

```tsx
// ✅ Decorative images (empty alt is OK)
<img src="decoration.jpg" alt="" role="presentation" />

// ✅ Or use CSS for decorative images
<div className="decoration" style={{ backgroundImage: 'url(decoration.jpg)' }} />
```

### Links with Icons

```tsx
// ✅ Links with icons
<a href="/download">
  <DownloadIcon aria-hidden="true" />
  Download PDF
</a>

<a href="/external" aria-label="Open external link">
  <ExternalIcon aria-hidden="true" />
  External Site
</a>
```

### Form Groups

```tsx
// ✅ Form with fieldset
<form>
  <fieldset>
    <legend>Contact Information</legend>
    <label htmlFor="name">Name</label>
    <input id="name" type="text" />
    
    <label htmlFor="email">Email</label>
    <input id="email" type="email" />
  </fieldset>
</form>
```

### Heading Structure

```tsx
// ✅ Proper heading hierarchy
<article>
  <h1>Article Title</h1>
  <section>
    <h2>Section Title</h2>
    <h3>Subsection Title</h3>
  </section>
  <section>
    <h2>Another Section</h2>
  </section>
</article>
```

## Edge Cases

### Dynamic Content

```tsx
// ⚠️ Dynamic content (warnings)
function DynamicImage({ alt }: { alt: string }) {
  return <img src="photo.jpg" alt={alt} />
}

// ✅ Provide default
function DynamicImage({ alt }: { alt?: string }) {
  return <img src="photo.jpg" alt={alt || 'Default description'} />
}
```

### Conditional Attributes

```tsx
// ✅ Conditional attributes
function Image({ src, alt, decorative }: ImageProps) {
  return (
    <img 
      src={src} 
      alt={decorative ? '' : alt || 'Image description'}
      role={decorative ? 'presentation' : undefined}
    />
  )
}
```

### Template Literals

```tsx
// ✅ HTML in template literals
const html = `
  <img src="photo.jpg" alt="Photo description" />
  <button aria-label="Click me">Click</button>
`
```

### Complex Forms

```tsx
// ✅ Complex form with multiple inputs
function ComplexForm() {
  return (
    <form>
      <fieldset>
        <legend>Personal Information</legend>
        <label htmlFor="firstName">First Name</label>
        <input id="firstName" type="text" />
        
        <label htmlFor="lastName">Last Name</label>
        <input id="lastName" type="text" />
      </fieldset>
      
      <fieldset>
        <legend>Contact Information</legend>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
        
        <label htmlFor="phone">Phone</label>
        <input id="phone" type="tel" />
      </fieldset>
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Skip Links

```tsx
// ✅ Skip links for navigation
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<main id="main-content">
  {/* Main content */}
</main>
```

## Best Practices

1. **Always provide alt text** for images (or empty alt for decorative images)
2. **Use descriptive link text** - avoid "click here", "read more"
3. **Label all form controls** - use id/for, aria-label, or aria-labelledby
4. **Maintain heading hierarchy** - don't skip levels
5. **Provide labels for icon buttons** - use aria-label
6. **Test with screen readers** - ESLint catches many issues, but manual testing is important

