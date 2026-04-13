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
 * Integration tests for ESLint rules
 * 
 * These tests run ESLint programmatically to verify rules work correctly
 */

describe('ESLint Rules Integration', () => {
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
        rules: {
          'a11y/image-alt': 'error',
          'a11y/button-label': 'error',
          'a11y/link-text': 'warn',
          'a11y/form-label': 'error',
          'a11y/heading-order': 'warn'
        }
      }
    })
  })

  describe('image-alt rule', () => {
    it('should detect missing alt attribute', async () => {
      const code = 'function Test() { return <img src="test.jpg" /> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      expect(results[0].messages.length).toBeGreaterThan(0)
      expect(results[0].messages.some(msg => 
        msg.ruleId === 'a11y/image-alt'
      )).toBe(true)
    })

    it('should pass for image with alt', async () => {
      const code = 'function Test() { return <img src="test.jpg" alt="Test" /> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      const imageAltErrors = results[0].messages.filter(msg => 
        msg.ruleId === 'a11y/image-alt'
      )
      expect(imageAltErrors.length).toBe(0)
    })
  })

  describe('button-label rule', () => {
    it('should detect button without label', async () => {
      const code = 'function Test() { return <button></button> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      expect(results[0].messages.length).toBeGreaterThan(0)
      expect(results[0].messages.some(msg => 
        msg.ruleId === 'a11y/button-label'
      )).toBe(true)
    })

    it('should pass for button with text', async () => {
      const code = 'function Test() { return <button>Click me</button> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      const buttonErrors = results[0].messages.filter(msg => 
        msg.ruleId === 'a11y/button-label'
      )
      expect(buttonErrors.length).toBe(0)
    })
  })

  describe('link-text rule', () => {
    it('should detect non-descriptive link text', async () => {
      const code = 'function Test() { return <a href="/about">Click here</a> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      expect(results[0].messages.some(msg => 
        msg.ruleId === 'a11y/link-text'
      )).toBe(true)
    })

    it('should pass for descriptive link text', async () => {
      const code = 'function Test() { return <a href="/about">About Us</a> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      const linkErrors = results[0].messages.filter(msg => 
        msg.ruleId === 'a11y/link-text'
      )
      expect(linkErrors.length).toBe(0)
    })
  })

  describe('form-label rule', () => {
    it('should detect input without label', async () => {
      const code = 'function Test() { return <input type="text" /> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      expect(results[0].messages.some(msg => 
        msg.ruleId === 'a11y/form-label'
      )).toBe(true)
    })

    it('should pass for input with aria-label', async () => {
      const code = 'function Test() { return <input type="text" aria-label="Name" /> }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      const formErrors = results[0].messages.filter(msg => 
        msg.ruleId === 'a11y/form-label'
      )
      expect(formErrors.length).toBe(0)
    })
  })

  describe('heading-order rule', () => {
    it('should detect skipped heading levels', async () => {
      const code = 'function Test() { return (<><h1>Title</h1><h3>Section</h3></>) }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      expect(results[0].messages.some(msg => 
        msg.ruleId === 'a11y/heading-order'
      )).toBe(true)
    })

    it('should pass for proper heading hierarchy', async () => {
      const code = 'function Test() { return (<><h1>Title</h1><h2>Subtitle</h2></>) }'
      const results = await eslint.lintText(code, {
        filePath: 'test.jsx'
      })

      const headingErrors = results[0].messages.filter(msg => 
        msg.ruleId === 'a11y/heading-order'
      )
      expect(headingErrors.length).toBe(0)
    })
  })
})

