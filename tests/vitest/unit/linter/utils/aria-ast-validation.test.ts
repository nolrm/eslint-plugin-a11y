import { describe, it, expect } from 'vitest'
import {
  validateRole,
  validateAriaProperty,
  validateRoleRequiredProperties,
  validateAriaUnsupportedElement,
  validateIdReference,
  validateJSXAria,
  validateVueAria
} from '../../../../../src/linter/eslint-plugin/utils/aria-ast-validation'

describe('aria-ast-validation', () => {
  describe('validateRole', () => {
    it('1. flags an invalid/unknown role', () => {
      const issues = validateRole('not-a-real-role', 'div')
      expect(issues).toHaveLength(1)
      expect(issues[0].id).toBe('aria-invalid-role')
    })

    it('2. flags a role used on an element it is not recommended for', () => {
      // checkbox role is only allowedOn ['input', 'div', 'span']
      const issues = validateRole('checkbox', 'button')
      expect(issues.some(i => i.id === 'aria-role-on-wrong-element')).toBe(true)
    })

    it('3. flags a redundant role matching the element implicit role', () => {
      // implicitRoles maps 'nav' -> 'navigation'
      const issues = validateRole('navigation', 'nav')
      expect(issues.some(i => i.id === 'aria-redundant-role')).toBe(true)
    })

    it('4. returns no issues for a valid, non-redundant, correctly-placed role', () => {
      const issues = validateRole('navigation', 'div')
      expect(issues).toHaveLength(0)
    })

    it('5. returns only the invalid-role issue and stops further checks for unknown roles', () => {
      const issues = validateRole('bogus-role', 'span')
      expect(issues).toEqual([
        { id: 'aria-invalid-role', message: 'Invalid ARIA role: "bogus-role"', severity: 'error' }
      ])
    })
  })

  describe('validateAriaProperty', () => {
    it('6. flags an invalid/unknown aria-* property', () => {
      const issues = validateAriaProperty('aria-not-real', 'x', 'div', null)
      expect(issues).toHaveLength(1)
      expect(issues[0].id).toBe('aria-invalid-property')
    })

    it('7. flags a deprecated property', () => {
      const issues = validateAriaProperty('aria-dropeffect', 'copy', 'div', null)
      expect(issues.some(i => i.id === 'aria-deprecated-property')).toBe(true)
    })

    it('8. flags an invalid value for a boolean-type property', () => {
      const issues = validateAriaProperty('aria-busy', 'yes', 'div', null)
      expect(issues.some(i => i.id === 'aria-invalid-property-value')).toBe(true)
    })

    it('9. accepts a valid value for a boolean-type property', () => {
      const issues = validateAriaProperty('aria-busy', 'true', 'div', null)
      expect(issues).toHaveLength(0)
    })

    it('10. flags an invalid value for an enum-type property', () => {
      const issues = validateAriaProperty('aria-dropeffect', 'teleport', 'div', null)
      expect(issues.some(i => i.id === 'aria-invalid-property-value')).toBe(true)
    })

    it('11. flags a property discouraged on a specific element key', () => {
      // ARIA_IN_HTML.discouraged['input[type="text"]'] includes 'aria-label'
      const issues = validateAriaProperty('aria-label', 'Name', 'input[type="text"]', null)
      expect(issues.some(i => i.id === 'aria-property-discouraged')).toBe(true)
    })

    it('12. flags a non-global property not allowed with the given role', () => {
      // aria-valuenow is not global (allowedOn doesn't include '*') and isn't in checkbox's allowedProperties
      const issues = validateAriaProperty('aria-valuenow', '5', 'div', 'checkbox')
      expect(issues.some(i => i.id === 'aria-property-not-allowed-with-role')).toBe(true)
    })

    it('13. does not flag a global property even if absent from the role allowedProperties list', () => {
      // aria-expanded is global (allowedOn: ['*']), so role restriction is skipped
      const issues = validateAriaProperty('aria-expanded', 'true', 'div', 'checkbox')
      expect(issues.some(i => i.id === 'aria-property-not-allowed-with-role')).toBe(false)
    })

    it('14. returns no issues for a valid property in a valid context', () => {
      const issues = validateAriaProperty('aria-label', 'Close', 'button', null)
      expect(issues).toHaveLength(0)
    })
  })

  describe('validateRoleRequiredProperties', () => {
    it('15. returns no issues when the (single) required property is present', () => {
      const issues = validateRoleRequiredProperties('checkbox', new Set(['aria-checked']))
      expect(issues).toHaveLength(0)
    })

    it('16. flags a missing single required property', () => {
      const issues = validateRoleRequiredProperties('checkbox', new Set())
      expect(issues).toEqual([
        {
          id: 'aria-role-missing-required-props',
          message: 'ARIA role "checkbox" is missing required property: "aria-checked"',
          severity: 'error'
        }
      ])
    })

    it('17. does not flag a role with no required properties (no-op)', () => {
      const issues = validateRoleRequiredProperties('button', new Set())
      expect(issues).toHaveLength(0)
    })

    it('18. returns no issues for an unknown role (early return)', () => {
      const issues = validateRoleRequiredProperties('not-a-real-role', new Set())
      expect(issues).toHaveLength(0)
    })

    it('19. skips the aria-level requirement for role="heading" on a native h1-h6 element', () => {
      const issues = validateRoleRequiredProperties('heading', new Set(), 'h2')
      expect(issues).toHaveLength(0)
    })

    it('20. flags a missing aria-level for role="heading" on a non-native element', () => {
      const issues = validateRoleRequiredProperties('heading', new Set(), 'div')
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('aria-level')
    })

    it('21. returns no issues when all requiredPropertiesAll entries are present (scrollbar)', () => {
      const issues = validateRoleRequiredProperties(
        'scrollbar',
        new Set(['aria-controls', 'aria-valuenow'])
      )
      expect(issues).toHaveLength(0)
    })

    it('22. flags each missing requiredPropertiesAll entry independently (scrollbar)', () => {
      const issues = validateRoleRequiredProperties('scrollbar', new Set(['aria-controls']))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('aria-valuenow')
    })

    it('23. flags both requiredPropertiesAll entries when neither is present (scrollbar)', () => {
      const issues = validateRoleRequiredProperties('scrollbar', new Set())
      expect(issues).toHaveLength(2)
    })
  })

  describe('validateAriaUnsupportedElement', () => {
    it('24. reports one issue per offending attribute on an unsupported element', () => {
      const issues = validateAriaUnsupportedElement('meta', ['role', 'aria-label'])
      expect(issues).toHaveLength(2)
      expect(issues.every(i => i.id === 'aria-unsupported-element')).toBe(true)
      expect(issues[0].message).toContain('<meta>')
      expect(issues[0].message).toContain('role')
      expect(issues[1].message).toContain('aria-label')
    })

    it('25. returns no issues for an unsupported element with no offending attributes', () => {
      const issues = validateAriaUnsupportedElement('meta', [])
      expect(issues).toHaveLength(0)
    })

    it('26. returns no issues for a supported element regardless of attribute names passed', () => {
      const issues = validateAriaUnsupportedElement('div', ['role', 'aria-label'])
      expect(issues).toHaveLength(0)
    })
  })

  describe('validateIdReference', () => {
    it('27. returns no issues when the referenced id exists', () => {
      const issues = validateIdReference('aria-labelledby', 'title-id', new Set(['title-id']))
      expect(issues).toHaveLength(0)
    })

    it('28. flags a reference to a non-existent id', () => {
      const issues = validateIdReference('aria-labelledby', 'missing-id', new Set())
      expect(issues).toEqual([
        {
          id: 'aria-invalid-id-reference',
          message: 'ARIA property "aria-labelledby" references non-existent ID: "missing-id"',
          severity: 'error'
        }
      ])
    })

    it('29. flags only the missing id among multiple space-separated idrefs', () => {
      const issues = validateIdReference('aria-describedby', 'known-id missing-id', new Set(['known-id']))
      expect(issues).toHaveLength(1)
      expect(issues[0].message).toContain('missing-id')
    })
  })

  describe('validateJSXAria', () => {
    it('30. returns no issues for a valid JSX element', () => {
      const node = {
        name: { type: 'JSXIdentifier', name: 'div' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'role' }, value: { type: 'Literal', value: 'checkbox' } },
          { type: 'JSXAttribute', name: { name: 'aria-checked' }, value: { type: 'Literal', value: 'true' } }
        ]
      } as any
      const issues = validateJSXAria(node, new Set())
      expect(issues).toHaveLength(0)
    })

    it('31. flags a missing role-required property on a JSX element', () => {
      const node = {
        name: { type: 'JSXIdentifier', name: 'div' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'role' }, value: { type: 'Literal', value: 'checkbox' } }
        ]
      } as any
      const issues = validateJSXAria(node, new Set())
      expect(issues.some(i => i.id === 'aria-role-missing-required-props')).toBe(true)
    })

    it('32. counts a dynamic aria-* value as present for the required-property check', () => {
      const node = {
        name: { type: 'JSXIdentifier', name: 'div' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'role' }, value: { type: 'Literal', value: 'checkbox' } },
          {
            type: 'JSXAttribute',
            name: { name: 'aria-checked' },
            value: { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'isChecked' } }
          }
        ]
      } as any
      const issues = validateJSXAria(node, new Set())
      expect(issues.some(i => i.id === 'aria-role-missing-required-props')).toBe(false)
    })

    it('33. flags role/aria-* attributes on an unsupported JSX element', () => {
      const node = {
        name: { type: 'JSXIdentifier', name: 'meta' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'aria-label' }, value: { type: 'Literal', value: 'description' } }
        ]
      } as any
      const issues = validateJSXAria(node, new Set())
      expect(issues).toEqual([
        {
          id: 'aria-unsupported-element',
          message: '<meta> does not support ARIA attributes; "aria-label" will be ignored by assistive technology',
          severity: 'error'
        }
      ])
    })

    it('34. skips spread attributes when checking for unsupported-element usage', () => {
      const node = {
        name: { type: 'JSXIdentifier', name: 'meta' },
        attributes: [
          { type: 'JSXSpreadAttribute', argument: { type: 'Identifier', name: 'props' } }
        ]
      } as any
      const issues = validateJSXAria(node, new Set())
      expect(issues).toHaveLength(0)
    })

    it('35. validates ID references for aria-labelledby using the provided id set', () => {
      const node = {
        name: { type: 'JSXIdentifier', name: 'input' },
        attributes: [
          { type: 'JSXAttribute', name: { name: 'aria-labelledby' }, value: { type: 'Literal', value: 'missing-id' } }
        ]
      } as any
      const issues = validateJSXAria(node, new Set())
      expect(issues.some(i => i.id === 'aria-invalid-id-reference')).toBe(true)
    })

    it('36. treats a dynamically-bound JSX role (role={expr}) as absent (no static role to validate)', () => {
      const node = {
        name: { type: 'JSXIdentifier', name: 'div' },
        attributes: [
          {
            type: 'JSXAttribute',
            name: { name: 'role' },
            value: { type: 'JSXExpressionContainer', expression: { type: 'Identifier', name: 'dynamicRole' } }
          }
        ]
      } as any
      const issues = validateJSXAria(node, new Set())
      expect(issues).toHaveLength(0)
    })

    it('37. falls back to an empty tag name for a non-identifier JSX element name (e.g. member expression)', () => {
      const node = {
        name: { type: 'JSXMemberExpression' }, // e.g. <Foo.Bar />, no name.name
        attributes: [
          { type: 'JSXAttribute', name: { name: 'aria-label' }, value: { type: 'Literal', value: 'x' } }
        ]
      } as any
      // Should not throw, and should not be treated as an unsupported element
      const issues = validateJSXAria(node, new Set())
      expect(issues.some(i => i.id === 'aria-unsupported-element')).toBe(false)
    })
  })

  describe('validateVueAria', () => {
    it('38. returns no issues for a valid Vue element', () => {
      const node = {
        name: 'div',
        startTag: {
          attributes: [
            { key: { name: 'role' }, value: { value: 'checkbox' } },
            { key: { name: 'aria-checked' }, value: { value: 'true' } }
          ]
        }
      } as any
      const issues = validateVueAria(node, new Set())
      expect(issues).toHaveLength(0)
    })

    it('39. flags a missing role-required property on a Vue element', () => {
      const node = {
        name: 'div',
        startTag: {
          attributes: [
            { key: { name: 'role' }, value: { value: 'checkbox' } }
          ]
        }
      } as any
      const issues = validateVueAria(node, new Set())
      expect(issues.some(i => i.id === 'aria-role-missing-required-props')).toBe(true)
    })

    it('40. flags role/aria-* attributes on an unsupported Vue element', () => {
      const node = {
        name: 'meta',
        startTag: {
          attributes: [
            { key: { name: 'role' }, value: { value: 'presentation' } }
          ]
        }
      } as any
      const issues = validateVueAria(node, new Set())
      expect(issues).toEqual([
        {
          id: 'aria-unsupported-element',
          message: '<meta> does not support ARIA attributes; "role" will be ignored by assistive technology',
          severity: 'error'
        }
      ])
    })

    it('41. returns no issues for an unsupported Vue element with no role/aria attributes', () => {
      const node = {
        name: 'meta',
        startTag: { attributes: [] }
      } as any
      const issues = validateVueAria(node, new Set())
      expect(issues).toHaveLength(0)
    })

    it('42. skips value validation for a dynamic Vue aria-* binding but still counts it as present', () => {
      const node = {
        name: 'div',
        startTag: {
          attributes: [
            { key: { name: 'role' }, value: { value: 'checkbox' } },
            // v-bind:aria-checked="isChecked" - no static `.value.value` string
            { key: { name: 'aria-checked' }, value: { expression: { type: 'Identifier', name: 'isChecked' } } }
          ]
        }
      } as any
      const issues = validateVueAria(node, new Set())
      expect(issues.some(i => i.id === 'aria-role-missing-required-props')).toBe(false)
      expect(issues.some(i => i.id === 'aria-invalid-property-value')).toBe(false)
    })

    it('43. validates ID references for aria-labelledby on a Vue element', () => {
      const node = {
        name: 'input',
        startTag: {
          attributes: [
            { key: { name: 'aria-labelledby' }, value: { value: 'missing-id' } }
          ]
        }
      } as any
      const issues = validateVueAria(node, new Set())
      expect(issues.some(i => i.id === 'aria-invalid-id-reference')).toBe(true)
    })

    it('44. treats a dynamically-bound Vue role (:role="expr") as absent (no static role to validate)', () => {
      const node = {
        name: 'div',
        startTag: {
          attributes: [
            // :role="dynamicRole" - value has no static `.value` string
            { key: { name: 'role' }, value: { expression: { type: 'Identifier', name: 'dynamicRole' } } }
          ]
        }
      } as any
      const issues = validateVueAria(node, new Set())
      expect(issues).toHaveLength(0)
    })
  })

  describe('previously-missing WAI-ARIA 1.2 roles (ARIA_ROLES completeness)', () => {
    // Regression coverage: these roles are valid per the WAI-ARIA 1.2 spec but were absent
    // from ARIA_ROLES, so validateRole incorrectly flagged them as 'aria-invalid-role'
    // (e.g. role="group" on a <div>, reported via a real eslint-disable workaround).
    const roles = [
      'group', 'radiogroup', 'generic', 'document', 'feed', 'list', 'listitem',
      'table', 'row', 'rowgroup', 'cell', 'gridcell', 'columnheader', 'rowheader',
      'caption', 'figure', 'note', 'definition', 'term', 'paragraph', 'blockquote',
      'deletion', 'insertion', 'math', 'directory'
    ]

    it.each(roles)('45. does not flag role="%s" as an invalid/unknown role', (role) => {
      const issues = validateRole(role, 'div')
      expect(issues.some(i => i.id === 'aria-invalid-role')).toBe(false)
    })

    it('46. flags the deprecated "directory" role as deprecated, not invalid', () => {
      const issues = validateRole('directory', 'div')
      expect(issues.some(i => i.id === 'aria-invalid-role')).toBe(false)
      expect(issues.some(i => i.id === 'aria-deprecated-role')).toBe(true)
    })
  })
})
