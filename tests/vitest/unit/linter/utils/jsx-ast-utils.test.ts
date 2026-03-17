import { describe, it, expect } from 'vitest'
import { isJSXAttributeDynamic, getJSXAttribute, hasJSXAttribute, jsxToElement } from '../../../../../src/linter/eslint-plugin/utils/jsx-ast-utils'
import type { Rule } from 'eslint'

// Minimal mock context — context is unused by the utility functions we test
const mockContext = {} as Rule.RuleContext

describe('jsx-ast-utils', () => {
  describe('isJSXAttributeDynamic', () => {
    it('1. returns false when attr has no value (boolean attribute)', () => {
      const attr = { type: 'JSXAttribute', name: { name: 'disabled' }, value: undefined } as any
      expect(isJSXAttributeDynamic(attr)).toBe(false)
    })

    it('2. returns true for JSXExpressionContainer with non-Literal expression', () => {
      const attr = {
        type: 'JSXAttribute',
        name: { name: 'alt' },
        value: { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'altText' } }
      } as any
      expect(isJSXAttributeDynamic(attr)).toBe(true)
    })

    it('3. returns false for JSXExpressionContainer with Literal expression', () => {
      const attr = {
        type: 'JSXAttribute',
        name: { name: 'alt' },
        value: { type: 'JSXExpressionContainer', expression: { type: 'Literal', value: 'hello' } }
      } as any
      expect(isJSXAttributeDynamic(attr)).toBe(false)
    })

    it('4. returns false for plain Literal value', () => {
      const attr = {
        type: 'JSXAttribute',
        name: { name: 'alt' },
        value: { type: 'Literal', value: 'description' }
      } as any
      expect(isJSXAttributeDynamic(attr)).toBe(false)
    })
  })

  describe('getJSXAttribute', () => {
    it('5. returns matching attribute by name', () => {
      const element = {
        type: 'JSXOpeningElement',
        name: { name: 'img' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'alt' }, value: { type: 'Literal', value: 'test' } }
        ]
      } as any
      const result = getJSXAttribute(element, 'alt')
      expect(result).toBeDefined()
      expect(result?.name.name).toBe('alt')
    })

    it('6. returns undefined when attribute not found', () => {
      const element = {
        type: 'JSXOpeningElement',
        name: { name: 'img' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'src' }, value: { type: 'Literal', value: 'img.jpg' } }
        ]
      } as any
      expect(getJSXAttribute(element, 'alt')).toBeUndefined()
    })

    it('7. skips spread attributes', () => {
      const element = {
        type: 'JSXOpeningElement',
        name: { name: 'img' },
        attributes: [
          { type: 'JSXSpreadAttribute', argument: { type: 'Identifier', name: 'props' } },
          { type: 'JSXAttribute', name: { name: 'alt' }, value: { type: 'Literal', value: 'test' } }
        ]
      } as any
      const result = getJSXAttribute(element, 'alt')
      expect(result).toBeDefined()
    })

    it('8. matches attribute by type when name is absent', () => {
      const element = {
        type: 'JSXOpeningElement',
        name: { name: 'input' },
        attributes: [
          { type: 'JSXAttribute', name: { type: 'aria-label' }, value: { type: 'Literal', value: 'Search' } }
        ]
      } as any
      const result = getJSXAttribute(element, 'aria-label')
      expect(result).toBeDefined()
    })
  })

  describe('hasJSXAttribute', () => {
    it('9. returns true when attribute exists', () => {
      const element = {
        type: 'JSXOpeningElement',
        name: { name: 'img' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'alt' }, value: { type: 'Literal', value: '' } }
        ]
      } as any
      expect(hasJSXAttribute(element, 'alt')).toBe(true)
    })

    it('10. returns false when attribute is absent', () => {
      const element = {
        type: 'JSXOpeningElement',
        name: { name: 'img' },
        attributes: []
      } as any
      expect(hasJSXAttribute(element, 'alt')).toBe(false)
    })
  })

  describe('jsxToElement', () => {
    it('11. falls back to div tag when element name has no name property', () => {
      // Covers lines 141-142: getJSXTagName fallback
      const node = {
        type: 'JSXOpeningElement',
        name: { type: 'JSXMemberExpression' }, // no name.name
        attributes: []
      } as any
      const el = jsxToElement(node, mockContext)
      expect(el.tagName.toLowerCase()).toBe('div')
    })

    it('12. reads attribute value from JSXExpressionContainer with Literal expression', () => {
      // Covers line 100-101: Literal expression inside JSXExpressionContainer
      const node = {
        type: 'JSXOpeningElement',
        name: { name: 'img' },
        attributes: [
          {
            type: 'JSXAttribute',
            name: { name: 'alt' },
            value: {
              type: 'JSXExpressionContainer',
              expression: { type: 'Literal', value: 'computed alt' }
            }
          }
        ]
      } as any
      const el = jsxToElement(node, mockContext)
      expect(el.getAttribute('alt')).toBe('computed alt')
    })

    it('13. skips dynamic JSXExpressionContainer attributes (non-Literal)', () => {
      const node = {
        type: 'JSXOpeningElement',
        name: { name: 'img' },
        attributes: [
          {
            type: 'JSXAttribute',
            name: { name: 'alt' },
            value: {
              type: 'JSXExpressionContainer',
              expression: { type: 'Identifier', name: 'altVar' }
            }
          }
        ]
      } as any
      const el = jsxToElement(node, mockContext)
      expect(el.getAttribute('alt')).toBeNull()
    })

    it('14. sets text content from JSXText children', () => {
      const node = {
        type: 'JSXElement',
        openingElement: {
          type: 'JSXOpeningElement',
          name: { name: 'button' },
          attributes: []
        },
        children: [
          { type: 'JSXText', value: 'Click me' }
        ]
      } as any
      const el = jsxToElement(node, mockContext)
      expect(el.textContent).toBe('Click me')
    })

    it('15. ignores JSXExpressionContainer children (returns empty string)', () => {
      // Covers lines 158-163: JSXExpressionContainer and default branch in getJSXTextContent
      const node = {
        type: 'JSXElement',
        openingElement: {
          type: 'JSXOpeningElement',
          name: { name: 'button' },
          attributes: []
        },
        children: [
          { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'label' } },
          { type: 'JSXElement' } // default branch
        ]
      } as any
      const el = jsxToElement(node, mockContext)
      expect(el.textContent).toBe('')
    })

    it('16. sets boolean attribute when value is absent', () => {
      const node = {
        type: 'JSXOpeningElement',
        name: { name: 'input' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'disabled' }, value: undefined }
        ]
      } as any
      const el = jsxToElement(node, mockContext)
      expect(el.hasAttribute('disabled')).toBe(true)
    })

    it('17. skips spread attributes when building element', () => {
      const node = {
        type: 'JSXOpeningElement',
        name: { name: 'div' },
        attributes: [
          { type: 'JSXSpreadAttribute', argument: { type: 'Identifier', name: 'props' } }
        ]
      } as any
      const el = jsxToElement(node, mockContext)
      expect(el.tagName.toLowerCase()).toBe('div')
      expect(el.attributes.length).toBe(0)
    })
  })
})
