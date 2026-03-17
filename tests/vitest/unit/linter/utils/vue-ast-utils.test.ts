import { describe, it, expect } from 'vitest'
import { isVueFile, isVueAttributeDynamic, getVueAttribute, hasVueAttribute, vueElementToDOM } from '../../../../../src/linter/eslint-plugin/utils/vue-ast-utils'
import type { Rule } from 'eslint'

describe('vue-ast-utils', () => {
  describe('isVueFile', () => {
    it('1. returns true for .vue file extension', () => {
      const context = {
        getFilename: () => 'MyComponent.vue',
        getSourceCode: () => ({ parserServices: null })
      } as any
      expect(isVueFile(context)).toBe(true)
    })

    it('2. returns false for .tsx file extension', () => {
      const context = {
        getFilename: () => 'MyComponent.tsx',
        getSourceCode: () => ({ parserServices: null })
      } as any
      expect(isVueFile(context)).toBeFalsy()
    })

    it('3. returns true when parserPath includes vue-eslint-parser', () => {
      // Covers line 76: parser is a string containing vue-eslint-parser
      const context = {
        parserPath: '/node_modules/vue-eslint-parser/index.js',
        getFilename: () => 'MyComponent.js',
        getSourceCode: () => ({ parserServices: undefined })
      } as any
      expect(isVueFile(context)).toBe(true)
    })

    it('4. returns false when parserPath is a non-vue parser string', () => {
      const context = {
        parserPath: '/node_modules/@typescript-eslint/parser/index.js',
        getFilename: () => 'MyComponent.ts',
        getSourceCode: () => ({ parserServices: undefined })
      } as any
      expect(isVueFile(context)).toBeFalsy()
    })
  })

  describe('isVueAttributeDynamic', () => {
    it('5. returns false when attr has no value', () => {
      const attr = { key: { name: 'disabled' }, value: undefined } as any
      expect(isVueAttributeDynamic(attr)).toBe(false)
    })

    it('6. returns true when attr value has an expression', () => {
      const attr = {
        key: { name: 'href' },
        value: { expression: { type: 'Identifier', name: 'url' } }
      } as any
      expect(isVueAttributeDynamic(attr)).toBe(true)
    })

    it('7. returns false when attr value has no expression', () => {
      const attr = {
        key: { name: 'href' },
        value: { value: '/about' }
      } as any
      expect(isVueAttributeDynamic(attr)).toBe(false)
    })
  })

  describe('getVueAttribute', () => {
    it('8. returns matching attribute by key name', () => {
      const element = {
        name: 'img',
        startTag: {
          attributes: [
            { key: { name: 'alt' }, value: { value: 'description' } }
          ]
        },
        type: 'VElement'
      } as any
      const result = getVueAttribute(element, 'alt')
      expect(result).toBeDefined()
      expect(result?.key.name).toBe('alt')
    })

    it('9. returns undefined when no attributes present (no startTag.attributes)', () => {
      // Covers lines 179-180: !element.startTag?.attributes guard
      const element = {
        name: 'img',
        startTag: {},
        type: 'VElement'
      } as any
      expect(getVueAttribute(element, 'alt')).toBeUndefined()
    })

    it('10. returns undefined when attribute not found', () => {
      const element = {
        name: 'img',
        startTag: {
          attributes: [
            { key: { name: 'src' }, value: { value: 'img.jpg' } }
          ]
        },
        type: 'VElement'
      } as any
      expect(getVueAttribute(element, 'alt')).toBeUndefined()
    })

    it('11. matches attribute by key argument', () => {
      const element = {
        name: 'input',
        startTag: {
          attributes: [
            { key: { argument: 'aria-label' }, value: { value: 'Search' } }
          ]
        },
        type: 'VElement'
      } as any
      expect(getVueAttribute(element, 'aria-label')).toBeDefined()
    })
  })

  describe('hasVueAttribute', () => {
    it('12. returns true when attribute exists', () => {
      const element = {
        name: 'img',
        startTag: {
          attributes: [
            { key: { name: 'alt' }, value: { value: '' } }
          ]
        },
        type: 'VElement'
      } as any
      expect(hasVueAttribute(element, 'alt')).toBe(true)
    })

    it('13. returns false when attribute is absent', () => {
      const element = {
        name: 'img',
        startTag: { attributes: [] },
        type: 'VElement'
      } as any
      expect(hasVueAttribute(element, 'alt')).toBe(false)
    })
  })

  describe('vueElementToDOM', () => {
    it('14. returns null for non-VElement node', () => {
      const node = { type: 'VText', value: 'hello' } as any
      expect(vueElementToDOM(node, {} as Rule.RuleContext)).toBeNull()
    })

    it('15. creates element with static attribute', () => {
      const node = {
        type: 'VElement',
        name: 'img',
        startTag: {
          attributes: [
            { key: { name: 'alt' }, value: { value: 'a dog' } }
          ]
        },
        children: []
      } as any
      const el = vueElementToDOM(node, {} as Rule.RuleContext)
      expect(el).not.toBeNull()
      expect(el!.getAttribute('alt')).toBe('a dog')
    })

    it('16. sets boolean attribute with empty string when value has no expression', () => {
      // Covers lines 139-141: boolean attribute path in attribute loop
      const node = {
        type: 'VElement',
        name: 'input',
        startTag: {
          attributes: [
            { key: { name: 'disabled' }, value: undefined }
          ]
        },
        children: []
      } as any
      const el = vueElementToDOM(node, {} as Rule.RuleContext)
      expect(el).not.toBeNull()
      expect(el!.hasAttribute('disabled')).toBe(true)
    })

    it('17. skips attribute when value has an expression (dynamic)', () => {
      const node = {
        type: 'VElement',
        name: 'img',
        startTag: {
          attributes: [
            { key: { name: 'alt' }, value: { expression: { type: 'Identifier', name: 'altText' } } }
          ]
        },
        children: []
      } as any
      const el = vueElementToDOM(node, {} as Rule.RuleContext)
      expect(el).not.toBeNull()
      expect(el!.getAttribute('alt')).toBeNull()
    })

    it('18. sets text content from VText children', () => {
      const node = {
        type: 'VElement',
        name: 'button',
        startTag: { attributes: [] },
        children: [
          { type: 'VText', value: 'Submit' }
        ]
      } as any
      const el = vueElementToDOM(node, {} as Rule.RuleContext)
      expect(el).not.toBeNull()
      expect(el!.textContent).toBe('Submit')
    })

    it('19. handles element with no startTag attributes', () => {
      const node = {
        type: 'VElement',
        name: 'div',
        startTag: {},
        children: []
      } as any
      const el = vueElementToDOM(node, {} as Rule.RuleContext)
      expect(el).not.toBeNull()
      expect(el!.tagName.toLowerCase()).toBe('div')
    })
  })
})
