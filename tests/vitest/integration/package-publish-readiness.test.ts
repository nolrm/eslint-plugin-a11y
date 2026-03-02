import { describe, it, expect } from 'vitest'
import { readFileSync, statSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { createRequire } from 'module'

/**
 * Package publish readiness tests
 *
 * Comprehensive gate tests that catch issues before publishing.
 * These validate npm pack contents, CJS/ESM exports, rule loading,
 * and package.json correctness.
 */

const root = process.cwd()
const packageJsonPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

describe('Package Publish Readiness', () => {
  describe('npm pack contents', () => {
    let packFiles: string[]

    beforeAll(() => {
      // npm pack --json output gets contaminated by the prepare script's build output,
      // so we parse the human-readable dry-run output instead.
      const output = execSync('npm pack --dry-run 2>&1', {
        cwd: root,
        encoding: 'utf-8',
      })
      packFiles = output
        .split('\n')
        .filter(line => line.startsWith('npm notice') && /\d+(\.\d+)?[kKmMgG]?B\s/.test(line))
        .map(line => line.replace(/^npm notice\s+[\d.]+[kKmMgG]?B\s+/, '').trim())
        .filter(Boolean)
    })

    it('should include all export-referenced files', () => {
      for (const [exportPath, conditions] of Object.entries(pkg.exports)) {
        for (const [condition, filePath] of Object.entries(conditions as Record<string, string>)) {
          const normalized = (filePath as string).replace(/^\.\//, '')
          expect(
            packFiles.includes(normalized),
            `Export "${exportPath}" -> "${condition}": ${normalized} should be in npm pack output`
          ).toBe(true)
        }
      }
    })

    it('should not leak source files', () => {
      const leakedSrc = packFiles.filter(f => f.startsWith('src/'))
      expect(leakedSrc, 'src/ files should not be in the tarball').toHaveLength(0)
    })

    it('should not leak test files', () => {
      const leakedTests = packFiles.filter(f => f.startsWith('tests/'))
      expect(leakedTests, 'tests/ files should not be in the tarball').toHaveLength(0)
    })

    it('should not leak config or env files', () => {
      const forbidden = ['.env', '.eslintrc', 'tsconfig.json', 'tsup.config.ts', 'vitest.config.ts']
      for (const name of forbidden) {
        expect(
          packFiles.includes(name),
          `${name} should not be in the tarball`
        ).toBe(false)
      }
    })

    it('should include README.md and LICENSE', () => {
      expect(packFiles.includes('README.md')).toBe(true)
      expect(packFiles.includes('LICENSE')).toBe(true)
    })

    it('should include bin/eslint-with-progress.js', () => {
      expect(packFiles.includes('bin/eslint-with-progress.js')).toBe(true)
    })
  })

  describe('CJS require works', () => {
    it('should be requireable and have rules and configs', () => {
      const require = createRequire(import.meta.url)
      const plugin = require(join(root, 'dist/linter/eslint-plugin/index.js'))

      expect(plugin).toBeDefined()
      expect(plugin.rules).toBeDefined()
      expect(typeof plugin.rules).toBe('object')
      expect(plugin.configs).toBeDefined()
      expect(typeof plugin.configs).toBe('object')
    })
  })

  describe('Export content validation', () => {
    it('. export should contain rules, configs, meta', () => {
      const content = readFileSync(join(root, 'dist/linter/eslint-plugin/index.js'), 'utf-8')
      expect(content.length).toBeGreaterThan(0)
      expect(content).toMatch(/rules/)
      expect(content).toMatch(/configs/)
      expect(content).toMatch(/meta/)
    })

    it('./core export should contain A11yChecker', () => {
      const content = readFileSync(join(root, 'dist/index.js'), 'utf-8')
      expect(content.length).toBeGreaterThan(0)
      expect(content).toContain('A11yChecker')
    })

    it('./formatter export should contain format function', () => {
      const content = readFileSync(join(root, 'dist/linter/eslint-plugin/formatter.js'), 'utf-8')
      expect(content.length).toBeGreaterThan(0)
      expect(content).toMatch(/format/)
    })

    it('./formatter-progress export should contain format function', () => {
      const content = readFileSync(join(root, 'dist/linter/eslint-plugin/formatter-with-progress.js'), 'utf-8')
      expect(content.length).toBeGreaterThan(0)
      expect(content).toMatch(/format/)
    })

    it('all built files referenced in exports should be non-empty', () => {
      for (const [exportPath, conditions] of Object.entries(pkg.exports)) {
        for (const [condition, filePath] of Object.entries(conditions as Record<string, string>)) {
          const fullPath = join(root, filePath as string)
          const stat = statSync(fullPath)
          expect(
            stat.size,
            `Export "${exportPath}" -> "${condition}": ${filePath} should be non-empty`
          ).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('All 43 rules loadable', () => {
    it('every rule in the built plugin should have meta and create', () => {
      const require = createRequire(import.meta.url)
      const plugin = require(join(root, 'dist/linter/eslint-plugin/index.js'))
      const ruleNames = Object.keys(plugin.rules)

      expect(ruleNames.length).toBe(43)

      for (const name of ruleNames) {
        const rule = plugin.rules[name]
        expect(rule.meta, `Rule "${name}" should have meta`).toBeDefined()
        expect(typeof rule.create, `Rule "${name}" should have create function`).toBe('function')
      }
    })
  })

  describe('Version consistency', () => {
    it('package.json version should match plugin meta version', () => {
      const require = createRequire(import.meta.url)
      const plugin = require(join(root, 'dist/linter/eslint-plugin/index.js'))

      expect(plugin.meta.version).toBe(pkg.version)
    })
  })

  describe('Peer dependencies', () => {
    it('should list eslint as a peer dependency', () => {
      expect(pkg.peerDependencies).toHaveProperty('eslint')
    })

    it('should not list vitest as a peer dependency', () => {
      expect(pkg.peerDependencies).not.toHaveProperty('vitest')
    })
  })

  describe('Package.json required fields', () => {
    const requiredFields = [
      'name',
      'version',
      'description',
      'license',
      'repository',
      'main',
      'module',
      'types',
      'exports',
    ]

    for (const field of requiredFields) {
      it(`should have "${field}" field`, () => {
        expect(pkg[field], `Missing required field: ${field}`).toBeDefined()
      })
    }
  })
})
