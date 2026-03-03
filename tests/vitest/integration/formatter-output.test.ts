import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

/**
 * Formatter Functional Tests
 *
 * Tests that formatters produce correct output given ESLint result objects
 */

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

const projectRoot = getProjectRoot()

function createMockResult(overrides: Record<string, unknown> = {}) {
  return {
    filePath: '/src/components/App.tsx',
    messages: [
      {
        ruleId: 'test-a11y-js/image-alt',
        severity: 2,
        message: 'img elements must have an alt prop',
        line: 10,
        column: 5,
        nodeType: 'JSXOpeningElement',
      },
      {
        ruleId: 'test-a11y-js/button-label',
        severity: 1,
        message: 'Buttons must have accessible text',
        line: 20,
        column: 3,
        nodeType: 'JSXOpeningElement',
      },
    ],
    errorCount: 1,
    warningCount: 1,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    ...overrides,
  }
}

function createCleanResult() {
  return {
    filePath: '/src/components/Clean.tsx',
    messages: [],
    errorCount: 0,
    warningCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
  }
}

describe('Formatter Output', () => {
  const formatterPath = resolve(projectRoot, 'dist/linter/eslint-plugin/formatter.js')
  const formatterModule = require(formatterPath)

  describe('default formatter', () => {
    it('should export a format function on the default export', () => {
      const formatter = formatterModule.default || formatterModule
      expect(typeof formatter.format).toBe('function')
    })

    it('should export a named format function', () => {
      expect(typeof formatterModule.format).toBe('function')
    })

    it('should return a string for results with violations', () => {
      const output = formatterModule.format([createMockResult()], false)
      expect(typeof output).toBe('string')
    })

    it('should contain the file path from the result', () => {
      const output = formatterModule.format([createMockResult()], false)
      expect(output).toContain('/src/components/App.tsx')
    })

    it('should contain rule IDs from the messages', () => {
      const output = formatterModule.format([createMockResult()], false)
      expect(output).toContain('test-a11y-js/image-alt')
      expect(output).toContain('test-a11y-js/button-label')
    })

    it('should show error and warning counts in summary', () => {
      const output = formatterModule.format([createMockResult()], false)
      expect(output).toContain('1 error')
      expect(output).toContain('1 warning')
    })

    it('should show clean output for zero-violation results', () => {
      const output = formatterModule.format([createCleanResult()], false)
      expect(output).toContain('No accessibility issues found')
      expect(output).not.toContain('error')
    })

    it('should handle multiple files', () => {
      const results = [createMockResult(), createCleanResult()]
      const output = formatterModule.format(results, false)
      expect(output).toContain('/src/components/App.tsx')
      expect(output).toContain('2 file')
    })
  })
})

describe('Formatter With Progress Output', () => {
  const formatterPath = resolve(projectRoot, 'dist/linter/eslint-plugin/formatter-with-progress.js')
  const formatterModule = require(formatterPath)

  describe('progress formatter', () => {
    it('should export a format function on the default export', () => {
      const formatter = formatterModule.default || formatterModule
      expect(typeof formatter.format).toBe('function')
    })

    it('should export a named format function', () => {
      expect(typeof formatterModule.format).toBe('function')
    })

    it('should return a string for results with violations', () => {
      const output = formatterModule.format([createMockResult()], false)
      expect(typeof output).toBe('string')
    })

    it('should contain file path and rule IDs', () => {
      const output = formatterModule.format([createMockResult()], false)
      expect(output).toContain('/src/components/App.tsx')
      expect(output).toContain('test-a11y-js/image-alt')
    })

    it('should show clean output for zero-violation results', () => {
      const output = formatterModule.format([createCleanResult()], false)
      expect(output).toContain('No accessibility issues found')
    })
  })
})
