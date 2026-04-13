/**
 * Integration tests for runtime comment feature
 */

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

describe('Runtime Comment Integration', () => {
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
        settings: {
          'a11y': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'suppress'
          }
        },
        rules: {
          'a11y/image-alt': 'error',
          'a11y/button-label': 'error',
          'a11y/link-text': 'warn'
        }
      }
    })
  })

  describe('image-alt rule with runtime comments', () => {
    it('should suppress error when runtime comment is present with suppress mode', async () => {
      const code = `
        function Test() {
          return (
            <div>
              {/* a11y-checked-at-runtime */}
              <img src="photo.jpg" />
            </div>
          )
        }
      `

      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(0)
    })

    it('should report error when no runtime comment', async () => {
      const code = `
        function Test() {
          return <img src="photo.jpg" />
        }
      `

      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(1)
      expect(results[0].messages[0].ruleId).toBe('a11y/image-alt')
    })

    it('should suppress error when runtime comment is on parent element', async () => {
      const code = `
        function Test() {
          return (
            <div>
              {/* a11y-checked-at-runtime */}
              <img src="photo.jpg" />
            </div>
          )
        }
      `

      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(0)
    })
  })

  describe('button-label rule with runtime comments', () => {
    it('should suppress error when runtime comment is present with suppress mode', async () => {
      const code = `
        function Test() {
          return (
            <div>
              {/* a11y-checked-at-runtime */}
              <button></button>
            </div>
          )
        }
      `

      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(0)
    })

    it('should report error when no runtime comment', async () => {
      const code = `
        function Test() {
          return <button></button>
        }
      `

      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(1)
      expect(results[0].messages[0].ruleId).toBe('a11y/button-label')
    })
  })

  describe('link-text rule with runtime comments', () => {
    it('should suppress warning when runtime comment is present with suppress mode', async () => {
      const code = `
        function Test() {
          return (
            <div>
              {/* a11y-checked-at-runtime */}
              <a href="/about">click here</a>
            </div>
          )
        }
      `

      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(0)
    })

    it('should report warning when no runtime comment', async () => {
      const code = `
        function Test() {
          return <a href="/about">click here</a>
        }
      `

      const results = await eslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(1)
      expect(results[0].messages[0].ruleId).toBe('a11y/link-text')
    })
  })

  describe('custom runtime comment marker', () => {
    it('should work with custom comment marker', async () => {
      const projectRoot = getProjectRoot()
      const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
      const plugin = require(pluginPath).default

      const customEslint = new ESLint({
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
          settings: {
            'a11y': {
              runtimeCheckedComment: 'checked-in-tests',
              runtimeCheckedMode: 'suppress'
            }
          },
          rules: {
            'a11y/image-alt': 'error'
          }
        }
      })

      const code = `
        function Test() {
          return (
            <div>
              {/* checked-in-tests */}
              <img src="photo.jpg" />
            </div>
          )
        }
      `

      const results = await customEslint.lintText(code, { filePath: 'test.tsx' })
      expect(results[0].messages).toHaveLength(0)
    })
  })
})
