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
        'a11y': plugin
      },
      baseConfig: {
        // The `plugins` constructor option above only supplies the plugin *implementation*;
        // the config must also declare the plugin name here or ESLint's rule resolver can't
        // find any 'a11y/*' rule (silently reports "Definition for rule ... was not found"
        // instead of running it - previously masked because every test below only asserted
        // that a message with the right ruleId existed, which was true for that
        // rule-not-found placeholder too).
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
          'a11y/aria-validation': 'error'
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
    expect(messages.some(m => m.ruleId === 'a11y/aria-validation')).toBe(true)
    expect(messages.some(m => m.message.includes('Invalid ARIA role'))).toBe(true)
  })

  it('should detect redundant role', async () => {
    const results = await eslint.lintText('<button role="button">Click</button>', {
      filePath: 'test.tsx'
    })

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    expect(messages.some(m => m.ruleId === 'a11y/aria-validation')).toBe(true)
    expect(messages.some(m => m.message.includes('Redundant role'))).toBe(true)
  })

  it('should validate ID references', async () => {
    const results = await eslint.lintText('<input aria-labelledby="missing-id" />', {
      filePath: 'test.tsx'
    })

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    expect(messages.some(m => m.ruleId === 'a11y/aria-validation')).toBe(true)
    expect(messages.some(m => m.message.includes('non-existent ID'))).toBe(true)
  })

  it('should pass for valid ARIA usage', async () => {
    const results = await eslint.lintText(
      '<label id="email-label">Email</label>;<input aria-labelledby="email-label" />',
      { filePath: 'test.tsx' }
    )

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    // No parse errors and no aria-validation violations for genuinely valid, well-formed usage.
    expect(messages).toEqual([])
  })

  it('should not flag role="group" as invalid (regression: role was missing from ARIA_ROLES)', async () => {
    const results = await eslint.lintText('<div role="group">Content</div>', {
      filePath: 'test.tsx'
    })

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    expect(messages).toEqual([])
  })

  it('should not flag other previously-missing WAI-ARIA 1.2 roles as invalid', async () => {
    const results = await eslint.lintText(
      '<div role="table"><div role="row"><div role="cell">1</div></div></div>',
      { filePath: 'test.tsx' }
    )

    expect(results).toHaveLength(1)
    const messages = results[0].messages
    const ariaErrors = messages.filter(m => m.ruleId === 'a11y/aria-validation')
    expect(ariaErrors).toEqual([])
  })
})
