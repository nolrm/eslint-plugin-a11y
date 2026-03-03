import { describe, it, expect, beforeAll } from 'vitest'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

function getProjectRoot(): string {
  const fromCwd = process.cwd()
  const pluginFromCwd = resolve(fromCwd, 'dist/linter/eslint-plugin/index.js')
  if (existsSync(pluginFromCwd)) return fromCwd
  const fromFile = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
  const pluginFromFile = resolve(fromFile, 'dist/linter/eslint-plugin/index.js')
  if (existsSync(pluginFromFile)) return fromFile
  throw new Error(
    'dist/linter/eslint-plugin/index.js not found. Ensure npm run build ran first.'
  )
}

let eslintPlugin: { meta?: { name?: string; version?: string }; rules?: Record<string, unknown>; configs?: Record<string, unknown> }

const ALL_RULE_NAMES = [
  'accessible-emoji',
  'anchor-ambiguous-text',
  'anchor-is-valid',
  'aria-activedescendant-has-tabindex',
  'aria-validation',
  'audio-captions',
  'autocomplete-valid',
  'button-label',
  'click-events-have-key-events',
  'control-has-associated-label',
  'details-summary',
  'dialog-modal',
  'fieldset-legend',
  'form-label',
  'form-validation',
  'heading-has-content',
  'heading-order',
  'html-has-lang',
  'iframe-title',
  'image-alt',
  'img-redundant-alt',
  'interactive-supports-focus',
  'landmark-roles',
  'lang',
  'link-text',
  'mouse-events-have-key-events',
  'no-access-key',
  'no-aria-hidden-on-focusable',
  'no-autofocus',
  'no-distracting-elements',
  'no-interactive-element-to-noninteractive-role',
  'no-noninteractive-element-interactions',
  'no-noninteractive-element-to-interactive-role',
  'no-noninteractive-tabindex',
  'no-redundant-roles',
  'no-role-presentation-on-focusable',
  'no-static-element-interactions',
  'prefer-tag-over-role',
  'scope',
  'semantic-html',
  'tabindex-no-positive',
  'table-structure',
  'video-captions',
]

describe('ESLint Plugin Structure', () => {
  beforeAll(() => {
    const root = getProjectRoot()
    eslintPlugin = require(resolve(root, 'dist/linter/eslint-plugin/index.js')).default
  })

  it('should export a plugin object', () => {
    expect(eslintPlugin).toBeDefined()
    expect(typeof eslintPlugin).toBe('object')
  })

  it('should have meta information', () => {
    expect(eslintPlugin.meta).toBeDefined()
    expect(eslintPlugin.meta!.name).toBe('eslint-plugin-test-a11y-js')
    expect(eslintPlugin.meta!.version).toBeDefined()
    expect(typeof eslintPlugin.meta!.version).toBe('string')
  })

  it('should have rules object (even if empty)', () => {
    expect(eslintPlugin.rules).toBeDefined()
    expect(typeof eslintPlugin.rules).toBe('object')
  })

  it('should have configs object', () => {
    expect(eslintPlugin.configs).toBeDefined()
    expect(typeof eslintPlugin.configs).toBe('object')
  })

  it('should have recommended config', () => {
    expect(eslintPlugin.configs).toBeDefined()
    const recommended = eslintPlugin.configs!.recommended as { plugins?: string[]; rules?: Record<string, unknown> } | undefined
    expect(recommended).toBeDefined()
    expect(recommended?.plugins).toContain('test-a11y-js')
    expect(recommended?.rules).toBeDefined()
  })

  it('should have recommended rules configured', () => {
    const recommended = eslintPlugin.configs!.recommended as { rules?: Record<string, unknown> }
    const rules = recommended?.rules
    expect(rules).toBeDefined()
    // Critical/Serious violations
    expect(rules).toHaveProperty('test-a11y-js/image-alt')
    expect(rules).toHaveProperty('test-a11y-js/button-label')
    expect(rules).toHaveProperty('test-a11y-js/form-label')
    expect(rules).toHaveProperty('test-a11y-js/iframe-title')
    expect(rules).toHaveProperty('test-a11y-js/fieldset-legend')
    expect(rules).toHaveProperty('test-a11y-js/table-structure')
    expect(rules).toHaveProperty('test-a11y-js/details-summary')
    expect(rules).toHaveProperty('test-a11y-js/video-captions')
    expect(rules).toHaveProperty('test-a11y-js/audio-captions')
    expect(rules).toHaveProperty('test-a11y-js/dialog-modal')
    expect(rules).toHaveProperty('test-a11y-js/no-access-key')
    expect(rules).toHaveProperty('test-a11y-js/no-autofocus')
    expect(rules).toHaveProperty('test-a11y-js/tabindex-no-positive')
    expect(rules).toHaveProperty('test-a11y-js/no-distracting-elements')
    expect(rules).toHaveProperty('test-a11y-js/no-aria-hidden-on-focusable')
    expect(rules).toHaveProperty('test-a11y-js/no-role-presentation-on-focusable')
    expect(rules).toHaveProperty('test-a11y-js/heading-has-content')
    expect(rules).toHaveProperty('test-a11y-js/html-has-lang')
    // Moderate/Minor violations
    expect(rules).toHaveProperty('test-a11y-js/link-text')
    expect(rules).toHaveProperty('test-a11y-js/heading-order')
    expect(rules).toHaveProperty('test-a11y-js/landmark-roles')
    expect(rules).toHaveProperty('test-a11y-js/click-events-have-key-events')
    expect(rules).toHaveProperty('test-a11y-js/no-static-element-interactions')
    expect(rules).toHaveProperty('test-a11y-js/interactive-supports-focus')
  })

  it('should export all 43 rules', () => {
    expect(eslintPlugin.rules).toBeDefined()
    const ruleNames = Object.keys(eslintPlugin.rules ?? {})
    expect(ruleNames).toHaveLength(43)

    for (const name of ALL_RULE_NAMES) {
      expect(eslintPlugin.rules).toHaveProperty(name)
    }
  })

  it('should have rules with correct meta information', () => {
    const imageAltRule = eslintPlugin.rules?.['image-alt'] as any
    expect(imageAltRule?.meta?.type).toBe('problem')
    expect(imageAltRule?.meta?.messages).toHaveProperty('missingAlt')

    const buttonLabelRule = eslintPlugin.rules?.['button-label'] as any
    expect(buttonLabelRule?.meta?.type).toBe('problem')
    expect(buttonLabelRule?.meta?.messages).toHaveProperty('missingLabel')

    const linkTextRule = eslintPlugin.rules?.['link-text'] as any
    expect(linkTextRule?.meta?.type).toBe('problem')
    expect(linkTextRule?.meta?.messages).toHaveProperty('missingText')

    const formLabelRule = eslintPlugin.rules?.['form-label'] as any
    expect(formLabelRule?.meta?.type).toBe('problem')
    expect(formLabelRule?.meta?.messages).toHaveProperty('missingLabel')

    const headingOrderRule = eslintPlugin.rules?.['heading-order'] as any
    expect(headingOrderRule?.meta?.type).toBe('problem')
    expect(headingOrderRule?.meta?.messages).toHaveProperty('skippedLevel')

    const iframeTitleRule = eslintPlugin.rules?.['iframe-title'] as any
    expect(iframeTitleRule?.meta?.type).toBe('problem')
    expect(iframeTitleRule?.meta?.messages).toHaveProperty('missingTitle')
  })

  it('every rule should have meta and create function', () => {
    for (const name of ALL_RULE_NAMES) {
      const rule = eslintPlugin.rules?.[name] as any
      expect(rule, `Rule "${name}" should exist`).toBeDefined()
      expect(rule?.meta, `Rule "${name}" should have meta`).toBeDefined()
      expect(typeof rule?.create, `Rule "${name}" should have create function`).toBe('function')
    }
  })

  it('should have correct severity levels in recommended config', () => {
    const recommendedConfig = eslintPlugin.configs?.recommended as any
    const rules = recommendedConfig?.rules
    // Critical/Serious violations should be errors
    expect(rules?.['test-a11y-js/image-alt']).toBe('error')
    expect(rules?.['test-a11y-js/button-label']).toBe('error')
    expect(rules?.['test-a11y-js/form-label']).toBe('error')
    expect(rules?.['test-a11y-js/iframe-title']).toBe('error')

    // Moderate/Minor violations should be warnings
    expect(rules?.['test-a11y-js/link-text']).toBe('warn')
    expect(rules?.['test-a11y-js/heading-order']).toBe('warn')
  })

  it('should have strict configuration', () => {
    const strictConfig = eslintPlugin.configs?.strict as any
    expect(strictConfig).toBeDefined()
    expect(strictConfig?.plugins).toContain('test-a11y-js')
    expect(strictConfig?.rules).toBeDefined()

    // All rules should be errors in strict mode
    const rules = strictConfig?.rules
    expect(rules?.['test-a11y-js/image-alt']).toBe('error')
    expect(rules?.['test-a11y-js/button-label']).toBe('error')
    expect(rules?.['test-a11y-js/link-text']).toBe('error')
    expect(rules?.['test-a11y-js/form-label']).toBe('error')
    expect(rules?.['test-a11y-js/heading-order']).toBe('error')
  })

  it('should have react configuration', () => {
    expect(eslintPlugin.configs?.react).toBeDefined()
    const reactConfig = eslintPlugin.configs?.react as any
    expect(reactConfig?.plugins).toContain('test-a11y-js')
    expect(reactConfig?.parser).toBe('@typescript-eslint/parser')
    expect(reactConfig?.parserOptions).toBeDefined()
    expect(reactConfig?.parserOptions?.ecmaFeatures?.jsx).toBe(true)
  })

  it('should have vue configuration', () => {
    expect(eslintPlugin.configs?.vue).toBeDefined()
    const vueConfig = eslintPlugin.configs?.vue as any
    expect(vueConfig?.plugins).toContain('test-a11y-js')
    expect(vueConfig?.parser).toBe('vue-eslint-parser')
    expect(vueConfig?.parserOptions).toBeDefined()
    expect(vueConfig?.parserOptions?.parser).toBe('@typescript-eslint/parser')
  })
})
