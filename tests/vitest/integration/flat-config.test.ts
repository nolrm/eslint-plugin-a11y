import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

describe('Flat Config Integration', () => {
  const pluginPath = join(process.cwd(), 'dist/linter/eslint-plugin/index.js')
  const testA11yJs = require(pluginPath).default

  describe('flat config presets exist', () => {
    it('should export flat/recommended config', () => {
      expect(testA11yJs.configs['flat/recommended']).toBeDefined()
      expect(testA11yJs.configs['flat/recommended'].rules).toBeDefined()
      expect(testA11yJs.configs['flat/recommended'].rules['a11y/image-alt']).toBeDefined()
    })

    it('should export flat/recommended-react config', () => {
      expect(testA11yJs.configs['flat/recommended-react']).toBeDefined()
      expect(testA11yJs.configs['flat/recommended-react'].rules).toBeDefined()
      expect(testA11yJs.configs['flat/recommended-react'].languageOptions).toBeDefined()
    })

    it('should export flat/react config', () => {
      expect(testA11yJs.configs['flat/react']).toBeDefined()
      expect(testA11yJs.configs['flat/react'].rules).toBeDefined()
      expect(testA11yJs.configs['flat/react'].languageOptions).toBeDefined()
    })

    it('should export flat/vue config', () => {
      expect(testA11yJs.configs['flat/vue']).toBeDefined()
      expect(testA11yJs.configs['flat/vue'].rules).toBeDefined()
      expect(testA11yJs.configs['flat/vue'].languageOptions).toBeDefined()
    })

    it('should export flat/minimal config', () => {
      expect(testA11yJs.configs['flat/minimal']).toBeDefined()
      expect(testA11yJs.configs['flat/minimal'].rules).toBeDefined()
      // Minimal should only have 3 rules
      const ruleCount = Object.keys(testA11yJs.configs['flat/minimal'].rules).length
      expect(ruleCount).toBe(3)
    })

    it('should export flat/strict config', () => {
      expect(testA11yJs.configs['flat/strict']).toBeDefined()
      expect(testA11yJs.configs['flat/strict'].rules).toBeDefined()
      // All rules should be errors in strict
      const rules = testA11yJs.configs['flat/strict'].rules
      const allErrors = Object.values(rules).every(severity => severity === 'error')
      expect(allErrors).toBe(true)
    })
  })

  describe('flat config structure', () => {
    it('should be spreadable into config array', () => {
      const config = {
        plugins: {
          'a11y': testA11yJs
        },
        ...testA11yJs.configs['flat/recommended']
      }
      
      expect(config.rules).toBeDefined()
      expect(config.plugins).toBeDefined()
    })

    it('should not include deprecated patterns', () => {
      const config = testA11yJs.configs['flat/recommended']
      // Should not have 'environments' or other deprecated patterns
      expect(config.environments).toBeUndefined()
    })
  })
})
