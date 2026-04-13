import { describe, it, expect } from 'vitest'
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
 * Component mapping integration tests
 * 
 * These tests verify that component mapping works with ESLint
 */
describe('Component Mapping Integration', () => {

  it('should lint custom Link component as anchor', async () => {
    const projectRoot = getProjectRoot()
    const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
    const plugin = require(pluginPath).default
    
    const eslintWithSettings = new ESLint({
      useEslintrc: false,
      plugins: {
        'a11y': plugin
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
          'a11y/link-text': 'warn'
        },
        settings: {
          'a11y': {
            components: {
              Link: 'a'
            }
          }
        }
      }
    })

    const results = await eslintWithSettings.lintText(
      '<Link href="/about">Click here</Link>',
      { filePath: 'test.tsx' }
    )

    expect(results).toHaveLength(1)
    const linkTextErrors = results[0].messages.filter(m => m.ruleId === 'a11y/link-text')
    expect(linkTextErrors.length).toBeGreaterThan(0)
  })

  it('should lint custom Button component as button', async () => {
    const projectRoot = getProjectRoot()
    const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
    const plugin = require(pluginPath).default
    
    const eslintWithSettings = new ESLint({
      useEslintrc: false,
      plugins: {
        'a11y': plugin
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
          'a11y/button-label': 'error'
        },
        settings: {
          'a11y': {
            components: {
              Button: 'button'
            }
          }
        }
      }
    })

    const results = await eslintWithSettings.lintText(
      '<Button></Button>',
      { filePath: 'test.tsx' }
    )

    expect(results).toHaveLength(1)
    const buttonErrors = results[0].messages.filter(m => m.ruleId === 'a11y/button-label')
    expect(buttonErrors.length).toBeGreaterThan(0)
  })

  it('should handle polymorphic components', async () => {
    const projectRoot = getProjectRoot()
    const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
    const plugin = require(pluginPath).default
    
    const eslintWithSettings = new ESLint({
      useEslintrc: false,
      plugins: {
        'a11y': plugin
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
          'a11y/link-text': 'warn'
        },
        settings: {
          'a11y': {
            polymorphicPropNames: ['as']
          }
        }
      }
    })

    const results = await eslintWithSettings.lintText(
      '<Link as="a" href="/about">Click here</Link>',
      { filePath: 'test.tsx' }
    )

    expect(results).toHaveLength(1)
    const linkTextErrors = results[0].messages.filter(m => m.ruleId === 'a11y/link-text')
    expect(linkTextErrors.length).toBeGreaterThan(0)
  })
})
