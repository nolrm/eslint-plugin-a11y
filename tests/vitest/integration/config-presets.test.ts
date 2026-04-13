import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

/**
 * Configuration Preset Tests
 *
 * Tests the built plugin's config objects with exact rule counts
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

describe('ESLint Config Presets', () => {
  const pluginPath = resolve(projectRoot, 'dist/linter/eslint-plugin/index.js')
  const plugin = require(pluginPath).default

  describe('Config Exports', () => {
    it('should export minimal config', () => {
      expect(plugin.configs.minimal).toBeDefined()
    })

    it('should export recommended config', () => {
      expect(plugin.configs.recommended).toBeDefined()
    })

    it('should export strict config', () => {
      expect(plugin.configs.strict).toBeDefined()
    })

    it('should export react config', () => {
      expect(plugin.configs.react).toBeDefined()
    })

    it('should export vue config', () => {
      expect(plugin.configs.vue).toBeDefined()
    })
  })

  describe('Minimal Config', () => {
    it('should have exactly 3 rules', () => {
      const rules = plugin.configs.minimal.rules
      const ruleCount = Object.keys(rules).length
      expect(ruleCount).toBe(3)
    })

    it('should include button-label, form-label, and image-alt as error', () => {
      const rules = plugin.configs.minimal.rules
      expect(rules['a11y/button-label']).toBe('error')
      expect(rules['a11y/form-label']).toBe('error')
      expect(rules['a11y/image-alt']).toBe('error')
    })
  })

  describe('Recommended Config', () => {
    it('should have exactly 30 rules', () => {
      const rules = plugin.configs.recommended.rules
      const ruleCount = Object.keys(rules).length
      expect(ruleCount).toBe(30)
    })

    it('should have critical rules as error', () => {
      const rules = plugin.configs.recommended.rules
      expect(rules['a11y/button-label']).toBe('error')
      expect(rules['a11y/form-label']).toBe('error')
      expect(rules['a11y/image-alt']).toBe('error')
      expect(rules['a11y/iframe-title']).toBe('error')
      expect(rules['a11y/video-captions']).toBe('error')
      expect(rules['a11y/audio-captions']).toBe('error')
    })

    it('should have moderate rules as warn', () => {
      const rules = plugin.configs.recommended.rules
      expect(rules['a11y/link-text']).toBe('warn')
      expect(rules['a11y/heading-order']).toBe('warn')
      expect(rules['a11y/landmark-roles']).toBe('warn')
    })
  })

  describe('Strict Config', () => {
    it('should have exactly 43 rules', () => {
      const rules = plugin.configs.strict.rules
      const ruleCount = Object.keys(rules).length
      expect(ruleCount).toBe(43)
    })

    it('should have all rules set to error', () => {
      const rules = plugin.configs.strict.rules
      const entries = Object.entries(rules)
      const allErrors = entries.every(([, severity]) => severity === 'error')
      expect(allErrors).toBe(true)
    })
  })

  describe('React Config', () => {
    it('should extend recommended rules', () => {
      const rules = plugin.configs.react.rules
      expect(rules).toBeDefined()
      expect(Object.keys(rules).length).toBeGreaterThanOrEqual(24)
    })

    it('should have JSX parser settings', () => {
      const config = plugin.configs.react
      // Classic configs use parserOptions at top level
      expect(config.parserOptions).toBeDefined()
      expect(config.parserOptions.ecmaFeatures?.jsx).toBe(true)
    })
  })

  describe('Vue Config', () => {
    it('should extend recommended rules', () => {
      const rules = plugin.configs.vue.rules
      expect(rules).toBeDefined()
      expect(Object.keys(rules).length).toBeGreaterThanOrEqual(24)
    })

    it('should have Vue parser settings', () => {
      const config = plugin.configs.vue
      // Classic configs use parser at top level
      expect(config.parser).toBeDefined()
    })
  })
})
