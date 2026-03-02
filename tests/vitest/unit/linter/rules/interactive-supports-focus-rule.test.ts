import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const interactiveSupportsFocus = getRule('interactive-supports-focus')

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
})

describe('interactive-supports-focus rule - JSX', () => {
  it('should pass for elements without interactive roles', () => {
    ruleTester.run('interactive-supports-focus', interactiveSupportsFocus, {
      valid: [
        { code: '<div>Content</div>' },
        { code: '<span>Text</span>' },
        { code: '<div role="presentation">Decorative</div>' },
        { code: '<div role="img" aria-label="Chart">Image</div>' }
      ],
      invalid: []
    })
  })

  it('should pass for native interactive elements', () => {
    ruleTester.run('interactive-supports-focus', interactiveSupportsFocus, {
      valid: [
        { code: '<button>Click me</button>' },
        { code: '<a href="/page">Link</a>' },
        { code: '<input type="text" />' },
        { code: '<select><option>One</option></select>' }
      ],
      invalid: []
    })
  })

  it('should pass for interactive roles with tabindex', () => {
    ruleTester.run('interactive-supports-focus', interactiveSupportsFocus, {
      valid: [
        { code: '<div role="button" tabIndex={0}>Custom button</div>' },
        { code: '<span role="link" tabIndex={0}>Custom link</span>' },
        { code: '<div role="checkbox" tabIndex={0}>Custom checkbox</div>' },
        { code: '<div role="tab" tabIndex="0">Tab</div>' }
      ],
      invalid: []
    })
  })

  it('should fail for interactive roles without tabindex', () => {
    ruleTester.run('interactive-supports-focus', interactiveSupportsFocus, {
      valid: [],
      invalid: [
        {
          code: '<div role="button">Custom button</div>',
          errors: [{ messageId: 'interactiveMustBeFocusable', data: { role: 'button' } }]
        },
        {
          code: '<span role="link">Custom link</span>',
          errors: [{ messageId: 'interactiveMustBeFocusable', data: { role: 'link' } }]
        },
        {
          code: '<div role="checkbox">Custom checkbox</div>',
          errors: [{ messageId: 'interactiveMustBeFocusable', data: { role: 'checkbox' } }]
        },
        {
          code: '<div role="tab">Tab</div>',
          errors: [{ messageId: 'interactiveMustBeFocusable', data: { role: 'tab' } }]
        },
        {
          code: '<div role="menuitem">Menu item</div>',
          errors: [{ messageId: 'interactiveMustBeFocusable', data: { role: 'menuitem' } }]
        }
      ]
    })
  })

  it('should provide suggestion to add tabindex', () => {
    ruleTester.run('interactive-supports-focus', interactiveSupportsFocus, {
      valid: [],
      invalid: [
        {
          code: '<div role="button">Custom button</div>',
          errors: [{
            messageId: 'interactiveMustBeFocusable',
            suggestions: [{
              desc: 'Add tabindex="0" to make element focusable',
              output: ''
            }]
          }]
        }
      ]
    })
  })
})

describe('interactive-supports-focus rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue interactive roles with tabindex', () => {
    vueRuleTester.run('interactive-supports-focus', interactiveSupportsFocus, {
      valid: [
        { code: '<template><div role="button" tabindex="0">Button</div></template>' },
        { code: '<template><span role="link" tabindex="0">Link</span></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue interactive roles without tabindex', () => {
    vueRuleTester.run('interactive-supports-focus', interactiveSupportsFocus, {
      valid: [],
      invalid: [
        {
          code: '<template><div role="button">Button</div></template>',
          errors: [{ messageId: 'interactiveMustBeFocusable', data: { role: 'button' } }]
        }
      ]
    })
  })
})
