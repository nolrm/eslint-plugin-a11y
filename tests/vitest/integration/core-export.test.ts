import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/**
 * Core Export Integration Test
 *
 * Tests that the ./core export path works and A11yChecker is functional
 * via both CJS and ESM.
 */

describe('./core export', () => {
  it('should export A11yChecker class via source', async () => {
    const coreModule = await import('../../../src/core/a11y-checker')
    expect(coreModule.A11yChecker).toBeDefined()
    expect(typeof coreModule.A11yChecker).toBe('function')
  })

  it('should export A11yChecker.check as a static method', async () => {
    const { A11yChecker } = await import('../../../src/core/a11y-checker')
    expect(typeof A11yChecker.check).toBe('function')
  })

  it('should detect a missing alt attribute on img', async () => {
    const { A11yChecker } = await import('../../../src/core/a11y-checker')

    document.body.innerHTML = '<img src="photo.jpg">'
    const results = await A11yChecker.check(document.body)

    expect(results).toBeDefined()
    expect(results.violations.length).toBeGreaterThan(0)
    expect(results.violations[0].id).toBe('image-alt')
  })

  it('should pass for accessible HTML', async () => {
    const { A11yChecker } = await import('../../../src/core/a11y-checker')

    document.body.innerHTML = '<img src="photo.jpg" alt="A beautiful sunset">'
    const results = await A11yChecker.check(document.body)

    const imgAltViolations = results.violations.filter(v => v.id === 'image-alt')
    expect(imgAltViolations.length).toBe(0)
  })

  it('should export A11yChecker via CJS dist (require)', () => {
    const corePath = join(process.cwd(), 'dist/index.js')
    const coreModule = require(corePath)
    expect(coreModule.A11yChecker).toBeDefined()
    expect(typeof coreModule.A11yChecker).toBe('function')
    expect(typeof coreModule.A11yChecker.check).toBe('function')
  })

  it('should export A11yChecker via ESM dist (import)', async () => {
    const coreMjsPath = join(process.cwd(), 'dist/index.mjs')
    const coreModule = await import(coreMjsPath)
    expect(coreModule.A11yChecker).toBeDefined()
    expect(typeof coreModule.A11yChecker).toBe('function')
  })

  it('should not export eslint plugin from ./core path', () => {
    const corePath = join(process.cwd(), 'dist/index.js')
    const coreModule = require(corePath)
    // ./core should only have A11yChecker, not ESLint plugin internals
    expect(coreModule.rules).toBeUndefined()
    expect(coreModule.configs).toBeUndefined()
  })
})
