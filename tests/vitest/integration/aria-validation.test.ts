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

describe('ARIA Validation Integration', () => {
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
          'test-a11y-js/aria-validation': 'error'
        }
      }
    })
  })

  it('should detect invalid ARIA role', async () => {
    const results = await eslint.lintText('<div role="invalid-role">Content</div>', {
      filePath: 'test.tsx'
    })

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    expect(messages.some(m => m.ruleId === 'test-a11y-js/aria-validation')).toBe(true)
  })

  it('should detect redundant role', async () => {
    const results = await eslint.lintText('<button role="button">Click</button>', {
      filePath: 'test.tsx'
    })

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    expect(messages.some(m => m.ruleId === 'test-a11y-js/aria-validation')).toBe(true)
  })

  it('should validate ID references', async () => {
    const results = await eslint.lintText('<input aria-labelledby="missing-id" />', {
      filePath: 'test.tsx'
    })

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    expect(messages.some(m => m.ruleId === 'test-a11y-js/aria-validation')).toBe(true)
  })

  it('should pass for valid ARIA usage', async () => {
    const results = await eslint.lintText(
      '<label id="email-label">Email</label><input aria-labelledby="email-label" />',
      { filePath: 'test.tsx' }
    )

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    const ariaErrors = messages.filter(m => m.ruleId === 'test-a11y-js/aria-validation')
    expect(ariaErrors.length).toBe(0)
  })
})
