import { describe, it, expect, beforeAll } from 'vitest'
import { ESLint } from 'eslint'
import { join, resolve, dirname } from 'path'
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
 * End-to-End tests that run the actual ESLint linter on real files
 * This simulates how users will actually use the plugin in their projects
 */

describe('ESLint - End-to-End with Real Files', () => {
  let fixturesDir: string
  let reactAppDir: string
  let eslint: ESLint

  beforeAll(() => {
    const projectRoot = getProjectRoot()
    fixturesDir = join(projectRoot, 'tests/e2e/fixtures')
    reactAppDir = join(fixturesDir, 'react-app')
    // Verify fixtures exist
    expect(existsSync(reactAppDir)).toBe(true)
    
    // Load the built plugin
    const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
    const plugin = require(pluginPath).default
    
    // Create ESLint instance with the plugin
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
        plugins: ['test-a11y-js'],
        extends: ['plugin:test-a11y-js/react']
      },
      cwd: reactAppDir
    })
  })

  describe('Member Expression Components', () => {
    it('should handle member expressions without crashing', async () => {
      const filePath = join(reactAppDir, 'src/components/EdgeCases.tsx')
      const results = await eslint.lintFiles([filePath])
      
      // Should not have fatal errors (crashes)
      const fatalMessages = results[0].messages.filter(
        (m: any) => m.fatal
      )
      
      expect(
        fatalMessages.length,
        `Fatal error: ${JSON.stringify(fatalMessages)}`
      ).toBe(0)
    })

    it('should detect violations in edge cases', async () => {
      const filePath = join(reactAppDir, 'src/components/EdgeCases.tsx')
      const results = await eslint.lintFiles([filePath])
      const messages = results[0].messages
      
      // Should detect missing labels in MissingLabels function
      const formLabelViolations = messages.filter((m: any) =>
        m.ruleId === 'test-a11y-js/form-label'
      )
      expect(formLabelViolations.length).toBeGreaterThan(0)
      
      // Should detect missing alt in MissingAlt function
      const imageAltViolations = messages.filter((m: any) =>
        m.ruleId === 'test-a11y-js/image-alt'
      )
      expect(imageAltViolations.length).toBeGreaterThan(0)
      
      // Should detect empty buttons
      const buttonViolations = messages.filter((m: any) =>
        m.ruleId === 'test-a11y-js/button-label'
      )
      expect(buttonViolations.length).toBeGreaterThan(0)
    })
  })

  describe('Form Components', () => {
    it('should pass valid form patterns', async () => {
      const filePath = join(reactAppDir, 'src/components/Form.tsx')
      const results = await eslint.lintFiles([filePath])
      
      // Should have no errors (all forms are properly labeled)
      const errorCount = results[0].errorCount
      
      // No fatal errors allowed
      const fatalMessages = results[0].messages.filter((m: any) => m.fatal)
      expect(fatalMessages.length).toBe(0)
      
      // All forms should be valid (no violations)
      expect(errorCount).toBe(0)
    })
  })

  describe('App Component', () => {
    it('should lint without crashing', async () => {
      const filePath = join(reactAppDir, 'src/App.tsx')
      const results = await eslint.lintFiles([filePath])
      
      // Should not have fatal errors
      const fatalMessages = results[0].messages.filter((m: any) => m.fatal)
      expect(fatalMessages.length).toBe(0)
    })
  })

  describe('Configuration Loading', () => {
    it('should load plugin configuration correctly', async () => {
      const filePath = join(reactAppDir, 'src/App.tsx')
      const config = await eslint.calculateConfigForFile(filePath)
      
      // Should have loaded the plugin
      expect(config.plugins).toContain('test-a11y-js')
      
      // Should have some rules enabled
      const a11yRules = Object.keys(config.rules || {}).filter(r => 
        r.startsWith('test-a11y-js/')
      )
      expect(a11yRules.length).toBeGreaterThan(0)
    })
  })

  describe('Entire Directory', () => {
    it('should lint all files without crashing', async () => {
      const srcDir = join(reactAppDir, 'src')
      const results = await eslint.lintFiles([`${srcDir}/**/*.{ts,tsx}`])
      
      // Should not have any fatal errors (crashes)
      const fatalErrors = results.filter(r => 
        r.messages.some((m: any) => m.fatal)
      )
      
      expect(
        fatalErrors.length,
        `Fatal errors found: ${JSON.stringify(fatalErrors, null, 2)}`
      ).toBe(0)
      
      // Count total violations
      const totalViolations = results.reduce(
        (sum, r) => sum + r.messages.length, 
        0
      )
      
      // We expect some violations (intentional issues in EdgeCases.tsx)
      expect(totalViolations).toBeGreaterThan(0)
    })
  })
})

