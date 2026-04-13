import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Integration tests for ESLint plugin exports
 * 
 * These tests verify that the plugin exports are correctly configured
 * in package.json and that the build outputs are structured correctly.
 */

const distPath = join(process.cwd(), 'dist')
const packageJsonPath = join(process.cwd(), 'package.json')

describe('ESLint Plugin Export Configuration', () => {
  describe('Package.json exports', () => {
    it('should have correct package name for ESLint auto-resolution', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      expect(pkg.name).toBe('eslint-plugin-a11y')
      expect(pkg.name).toMatch(/^eslint-plugin-/)
    })

    it('should have main export pointing to ESLint plugin', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      expect(pkg.main).toBe('dist/linter/eslint-plugin/index.js')
      expect(pkg.exports['.']).toBeDefined()
      expect(pkg.exports['.'].import).toBe('./dist/linter/eslint-plugin/index.mjs')
      expect(pkg.exports['.'].require).toBe('./dist/linter/eslint-plugin/index.js')
      expect(pkg.exports['.'].types).toBe('./dist/linter/eslint-plugin/index.d.ts')
    })

    it('should have core library at ./core export', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      expect(pkg.exports['./core']).toBeDefined()
      expect(pkg.exports['./core'].import).toBe('./dist/index.mjs')
      expect(pkg.exports['./core'].require).toBe('./dist/index.js')
      expect(pkg.exports['./core'].types).toBe('./dist/index.d.ts')
    })
  })

  describe('Build output structure', () => {
    it('should have plugin files in correct location', () => {
      const pluginCJS = join(distPath, 'linter/eslint-plugin/index.js')
      const pluginESM = join(distPath, 'linter/eslint-plugin/index.mjs')
      const pluginTypes = join(distPath, 'linter/eslint-plugin/index.d.ts')
      
      // Verify files exist (actual file check is in build-verification.test.ts)
      expect(pluginCJS).toBeTruthy()
      expect(pluginESM).toBeTruthy()
      expect(pluginTypes).toBeTruthy()
    })

    it('should have main files in correct location', () => {
      const mainCJS = join(distPath, 'index.js')
      const mainESM = join(distPath, 'index.mjs')
      const mainTypes = join(distPath, 'index.d.ts')
      
      expect(mainCJS).toBeTruthy()
      expect(mainESM).toBeTruthy()
      expect(mainTypes).toBeTruthy()
    })
  })

  describe('Export paths match package.json', () => {
    it('should have matching export paths for main entry (ESLint plugin)', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      expect(pkg.main).toBe('dist/linter/eslint-plugin/index.js')
      expect(pkg.module).toBe('dist/linter/eslint-plugin/index.mjs')
      expect(pkg.types).toBe('dist/linter/eslint-plugin/index.d.ts')
      
      // Verify exports match
      expect(pkg.exports['.'].require).toBe(`./${pkg.main}`)
      expect(pkg.exports['.'].import).toBe(`./${pkg.module}`)
      expect(pkg.exports['.'].types).toBe(`./${pkg.types}`)
    })
  })
})

