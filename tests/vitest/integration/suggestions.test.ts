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

describe('ESLint Suggestions Integration', () => {
  let eslint: ESLint

  beforeAll(() => {
    const projectRoot = getProjectRoot()
    const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
    const plugin = require(pluginPath).default
    
    eslint = new ESLint({
      useEslintrc: false,
      plugins: {
        'test-a11y-js': plugin
      },
      baseConfig: {
        parser: require.resolve('@typescript-eslint/parser'),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true
          }
        },
        rules: {
          'test-a11y-js/iframe-title': 'error',
          'test-a11y-js/button-label': 'error',
          'test-a11y-js/link-text': 'warn',
          'test-a11y-js/heading-order': 'warn'
        }
      }
    })
  })

  describe('suggestions are available', () => {
    it('should detect violations that support suggestions', async () => {
      // Test that rules with suggestions work correctly
      // Note: Suggestions are tested in unit tests; here we verify rules work
      // Wrap in a component so JSX is valid
      const code = `
        function Test() {
          return (
            <>
              <iframe src="/page.html" />
              <button></button>
              <a href="/about">Click here</a>
            </>
          )
        }
      `
      const results = await eslint.lintText(code, { filePath: 'test.tsx' })

      expect(results).toHaveLength(1)
      const messages = results[0].messages
      
      // Debug: log messages if test fails
      if (messages.length === 0) {
        console.log('No messages returned. Results:', JSON.stringify(results, null, 2))
      }
      
      // Verify rules trigger (at least one should)
      const hasIframe = messages.some(m => m.ruleId === 'test-a11y-js/iframe-title')
      const hasButton = messages.some(m => m.ruleId === 'test-a11y-js/button-label')
      const hasLink = messages.some(m => m.ruleId === 'test-a11y-js/link-text')
      
      // At least one rule should trigger
      expect(hasIframe || hasButton || hasLink).toBe(true)
    })
  })
})
