import { describe, it, expect, beforeAll } from 'vitest'
import { ESLint } from 'eslint'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

function getProjectRoot(): string {
  const fromCwd = process.cwd()
  const pluginFromCwd = resolve(fromCwd, 'dist/linter/eslint-plugin/index.js')
  if (existsSync(pluginFromCwd)) return fromCwd
  const fromFile = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
  const pluginFromFile = resolve(fromFile, 'dist/linter/eslint-plugin/index.js')
  if (existsSync(pluginFromFile)) return fromFile
  throw new Error(
    `dist/linter/eslint-plugin/index.js not found. Tried cwd=${fromCwd} and fileRoot=${fromFile}. Ensure npm run build ran first.`
  )
}

/**
 * Real-world example tests
 * 
 * These tests verify the rules work with realistic component code
 */

describe('Real-world Examples', () => {
  let eslint: ESLint

  beforeAll(() => {
    const projectRoot = getProjectRoot()
    const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
    const plugin = require(pluginPath).default
    
    eslint = new ESLint({
      useEslintrc: false,
      plugins: {
        'a11y': plugin
      },
      baseConfig: {
        plugins: ['a11y'],
        parser: require.resolve('@typescript-eslint/parser'),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true
          }
        },
        extends: ['plugin:a11y/recommended']
      }
    })
  })

  it('should catch violations in a React component', async () => {
    const code = `
      function MyComponent() {
        return (
          <div>
            <img src="photo.jpg" />
            <button></button>
            <a href="/more">Read more</a>
            <input type="text" />
            <h1>Title</h1>
            <h3>Section</h3>
          </div>
        )
      }
    `

    const results = await eslint.lintText(code, {
      filePath: 'MyComponent.jsx'
    })

    const messages = results[0].messages
    expect(messages.length).toBeGreaterThan(0)
    
    // Should catch image-alt violation
    expect(messages.some(msg => msg.ruleId === 'a11y/image-alt')).toBe(true)
    // Should catch button-label violation
    expect(messages.some(msg => msg.ruleId === 'a11y/button-label')).toBe(true)
    // Should catch link-text violation
    expect(messages.some(msg => msg.ruleId === 'a11y/link-text')).toBe(true)
    // Should catch form-label violation
    expect(messages.some(msg => msg.ruleId === 'a11y/form-label')).toBe(true)
    // Should catch heading-order violation
    expect(messages.some(msg => msg.ruleId === 'a11y/heading-order')).toBe(true)
  })

  it('should pass for accessible component', async () => {
    const code = `
      function AccessibleComponent() {
        return (
          <div>
            <img src="photo.jpg" alt="A beautiful landscape" />
            <button aria-label="Close menu">×</button>
            <a href="/about">About our company</a>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" />
            <h1>Title</h1>
            <h2>Subtitle</h2>
            <h3>Section</h3>
          </div>
        )
      }
    `

    const results = await eslint.lintText(code, {
      filePath: 'AccessibleComponent.jsx'
    })

    const a11yMessages = results[0].messages.filter(msg => 
      msg.ruleId?.startsWith('a11y/')
    )
    expect(a11yMessages.length).toBe(0)
  })

  it('should handle component with mixed violations', async () => {
    const code = `
      function MixedComponent() {
        return (
          <article>
            <img src="header.jpg" alt="Header image" />
            <img src="content.jpg" />
            <button>Save</button>
            <button aria-label="Delete"></button>
            <a href="/blog">Read our blog posts</a>
            <a href="/more">more</a>
          </article>
        )
      }
    `

    const results = await eslint.lintText(code, {
      filePath: 'MixedComponent.jsx'
    })

    const messages = results[0].messages
    // Should catch the missing alt
    expect(messages.some(msg => 
      msg.ruleId === 'a11y/image-alt'
    )).toBe(true)
    // Should catch non-descriptive link
    expect(messages.some(msg => 
      msg.ruleId === 'a11y/link-text'
    )).toBe(true)
  })
})

