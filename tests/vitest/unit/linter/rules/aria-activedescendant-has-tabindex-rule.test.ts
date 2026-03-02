import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const ariaActivedescendantHasTabindex = getRule('aria-activedescendant-has-tabindex')

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

describe('aria-activedescendant-has-tabindex rule - JSX', () => {
  it('should pass for elements without aria-activedescendant', () => {
    ruleTester.run('aria-activedescendant-has-tabindex', ariaActivedescendantHasTabindex, {
      valid: [
        { code: '<div>Content</div>' },
        { code: '<ul><li>Item</li></ul>' },
        { code: '<div role="listbox"><div role="option">Option</div></div>' }
      ],
      invalid: []
    })
  })

  it('should pass for natively focusable elements with aria-activedescendant', () => {
    ruleTester.run('aria-activedescendant-has-tabindex', ariaActivedescendantHasTabindex, {
      valid: [
        { code: '<input aria-activedescendant="option-1" />' },
        { code: '<select aria-activedescendant="option-1"><option>One</option></select>' },
        { code: '<textarea aria-activedescendant="option-1"></textarea>' }
      ],
      invalid: []
    })
  })

  it('should pass for elements with aria-activedescendant and tabindex', () => {
    ruleTester.run('aria-activedescendant-has-tabindex', ariaActivedescendantHasTabindex, {
      valid: [
        { code: '<div role="listbox" tabIndex={0} aria-activedescendant="option-1"><div role="option">Option</div></div>' },
        { code: '<ul role="listbox" tabIndex={-1} aria-activedescendant="item-1"><li role="option">Item</li></ul>' },
        { code: '<div role="combobox" tabIndex="0" aria-activedescendant="option-1">Combobox</div>' }
      ],
      invalid: []
    })
  })

  it('should fail for elements with aria-activedescendant but no tabindex', () => {
    ruleTester.run('aria-activedescendant-has-tabindex', ariaActivedescendantHasTabindex, {
      valid: [],
      invalid: [
        {
          code: '<div role="listbox" aria-activedescendant="option-1"><div role="option">Option</div></div>',
          errors: [{ messageId: 'missingTabindex' }]
        },
        {
          code: '<ul role="listbox" aria-activedescendant="item-1"><li role="option">Item</li></ul>',
          errors: [{ messageId: 'missingTabindex' }]
        },
        {
          code: '<div role="combobox" aria-activedescendant="option-1">Combobox</div>',
          errors: [{ messageId: 'missingTabindex' }]
        }
      ]
    })
  })

  it('should provide suggestion to add tabindex', () => {
    ruleTester.run('aria-activedescendant-has-tabindex', ariaActivedescendantHasTabindex, {
      valid: [],
      invalid: [
        {
          code: '<div role="listbox" aria-activedescendant="option-1">Options</div>',
          errors: [{
            messageId: 'missingTabindex',
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

describe('aria-activedescendant-has-tabindex rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue elements with tabindex', () => {
    vueRuleTester.run('aria-activedescendant-has-tabindex', ariaActivedescendantHasTabindex, {
      valid: [
        { code: '<template><div role="listbox" tabindex="0" aria-activedescendant="opt-1">Options</div></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue elements without tabindex', () => {
    vueRuleTester.run('aria-activedescendant-has-tabindex', ariaActivedescendantHasTabindex, {
      valid: [],
      invalid: [
        {
          code: '<template><div role="listbox" aria-activedescendant="opt-1">Options</div></template>',
          errors: [{ messageId: 'missingTabindex' }]
        }
      ]
    })
  })
})
