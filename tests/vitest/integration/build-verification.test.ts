import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Build verification tests
 *
 * These tests verify that the build process correctly generates
 * all required files and that package.json exports are correct.
 */

const distPath = join(process.cwd(), 'dist')
const packageJsonPath = join(process.cwd(), 'package.json')

describe('Build Verification', () => {
  describe('Build output files', () => {
    it('should generate main entry point (CJS)', () => {
      const mainFile = join(distPath, 'index.js')
      expect(existsSync(mainFile)).toBe(true)
    })

    it('should generate module entry point (ESM)', () => {
      const moduleFile = join(distPath, 'index.mjs')
      expect(existsSync(moduleFile)).toBe(true)
    })

    it('should generate TypeScript definitions', () => {
      const typesFile = join(distPath, 'index.d.ts')
      expect(existsSync(typesFile)).toBe(true)
    })

    it('should generate ESLint plugin (CJS)', () => {
      const pluginFile = join(distPath, 'linter/eslint-plugin/index.js')
      expect(existsSync(pluginFile)).toBe(true)
    })

    it('should generate ESLint plugin (ESM)', () => {
      const pluginFile = join(distPath, 'linter/eslint-plugin/index.mjs')
      expect(existsSync(pluginFile)).toBe(true)
    })

    it('should generate ESLint plugin TypeScript definitions', () => {
      const pluginTypesFile = join(distPath, 'linter/eslint-plugin/index.d.ts')
      expect(existsSync(pluginTypesFile)).toBe(true)
    })

    it('should generate formatter (CJS)', () => {
      expect(existsSync(join(distPath, 'linter/eslint-plugin/formatter.js'))).toBe(true)
    })

    it('should generate formatter (ESM)', () => {
      expect(existsSync(join(distPath, 'linter/eslint-plugin/formatter.mjs'))).toBe(true)
    })

    it('should generate formatter TypeScript definitions', () => {
      expect(existsSync(join(distPath, 'linter/eslint-plugin/formatter.d.ts'))).toBe(true)
    })

    it('should generate formatter-with-progress (CJS)', () => {
      expect(existsSync(join(distPath, 'linter/eslint-plugin/formatter-with-progress.js'))).toBe(true)
    })

    it('should generate formatter-with-progress (ESM)', () => {
      expect(existsSync(join(distPath, 'linter/eslint-plugin/formatter-with-progress.mjs'))).toBe(true)
    })

    it('should generate formatter-with-progress TypeScript definitions', () => {
      expect(existsSync(join(distPath, 'linter/eslint-plugin/formatter-with-progress.d.ts'))).toBe(true)
    })
  })

  describe('Package.json exports', () => {
    it('should have correct package name', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      expect(pkg.name).toBe('eslint-plugin-a11y')
    })

    it('should have correct exports configuration', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      expect(pkg.exports).toBeDefined()
      expect(pkg.exports['.']).toBeDefined()
      expect(pkg.exports['./core']).toBeDefined()
      expect(pkg.exports['./formatter']).toBeDefined()
      expect(pkg.exports['./formatter-progress']).toBeDefined()
    })

    it('should export main entry point as ESLint plugin', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      expect(pkg.exports['.'].import).toBe('./dist/linter/eslint-plugin/index.mjs')
      expect(pkg.exports['.'].require).toBe('./dist/linter/eslint-plugin/index.js')
      expect(pkg.exports['.'].types).toBe('./dist/linter/eslint-plugin/index.d.ts')
    })

    it('should export core library at ./core', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      expect(pkg.exports['./core'].import).toBe('./dist/index.mjs')
      expect(pkg.exports['./core'].require).toBe('./dist/index.js')
      expect(pkg.exports['./core'].types).toBe('./dist/index.d.ts')
    })

    it('should export formatter at ./formatter', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      expect(pkg.exports['./formatter'].import).toBe('./dist/linter/eslint-plugin/formatter.mjs')
      expect(pkg.exports['./formatter'].require).toBe('./dist/linter/eslint-plugin/formatter.js')
      expect(pkg.exports['./formatter'].types).toBe('./dist/linter/eslint-plugin/formatter.d.ts')
    })

    it('should export formatter-progress at ./formatter-progress', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      expect(pkg.exports['./formatter-progress'].import).toBe('./dist/linter/eslint-plugin/formatter-with-progress.mjs')
      expect(pkg.exports['./formatter-progress'].require).toBe('./dist/linter/eslint-plugin/formatter-with-progress.js')
      expect(pkg.exports['./formatter-progress'].types).toBe('./dist/linter/eslint-plugin/formatter-with-progress.d.ts')
    })

    it('should have correct main, module, and types fields (ESLint plugin)', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      expect(pkg.main).toBe('dist/linter/eslint-plugin/index.js')
      expect(pkg.module).toBe('dist/linter/eslint-plugin/index.mjs')
      expect(pkg.types).toBe('dist/linter/eslint-plugin/index.d.ts')
    })

    it('every file referenced in exports should exist on disk', () => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const root = process.cwd()

      for (const [exportPath, conditions] of Object.entries(pkg.exports)) {
        for (const [condition, filePath] of Object.entries(conditions as Record<string, string>)) {
          const fullPath = join(root, filePath)
          expect(existsSync(fullPath), `Export "${exportPath}" -> "${condition}": ${filePath} should exist`).toBe(true)
        }
      }
    })
  })

  describe('Build output content', () => {
    it('should have valid JavaScript in main file', () => {
      const mainFile = join(distPath, 'index.js')
      const content = readFileSync(mainFile, 'utf-8')

      // Basic sanity checks
      expect(content.length).toBeGreaterThan(0)
      expect(content).toContain('A11yChecker')
    })

    it('should have valid JavaScript in plugin file', () => {
      const pluginFile = join(distPath, 'linter/eslint-plugin/index.js')
      const content = readFileSync(pluginFile, 'utf-8')

      // Basic sanity checks
      expect(content.length).toBeGreaterThan(0)
      // Plugin should export rules and configs
      expect(content).toMatch(/rules|configs/)
    })
  })
})
