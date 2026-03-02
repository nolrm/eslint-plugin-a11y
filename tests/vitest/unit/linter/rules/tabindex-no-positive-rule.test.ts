import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const tabindexNoPositive = getRule('tabindex-no-positive')

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

describe('tabindex-no-positive rule - JSX', () => {
  it('should pass for elements without tabindex or with valid tabindex', () => {
    ruleTester.run('tabindex-no-positive', tabindexNoPositive, {
      valid: [
        { code: '<button>Click me</button>' },
        { code: '<div tabIndex={0}>Focusable</div>' },
        { code: '<div tabIndex="0">Focusable</div>' },
        { code: '<div tabIndex={-1}>Programmatic focus</div>' },
        { code: '<div tabIndex="-1">Programmatic focus</div>' },
        { code: '<span tabIndex={0}></span>' }
      ],
      invalid: []
    })
  })

  it('should fail for elements with positive tabindex', () => {
    ruleTester.run('tabindex-no-positive', tabindexNoPositive, {
      valid: [],
      invalid: [
        {
          code: '<div tabIndex={1}>Content</div>',
          errors: [{ messageId: 'noPositiveTabindex', data: { value: '1' } }]
        },
        {
          code: '<div tabIndex="1">Content</div>',
          errors: [{ messageId: 'noPositiveTabindex', data: { value: '1' } }]
        },
        {
          code: '<button tabIndex={5}>Click</button>',
          errors: [{ messageId: 'noPositiveTabindex', data: { value: '5' } }]
        },
        {
          code: '<input tabIndex="99" type="text" />',
          errors: [{ messageId: 'noPositiveTabindex', data: { value: '99' } }]
        }
      ]
    })
  })

  it('should provide suggestion to change to tabindex 0', () => {
    ruleTester.run('tabindex-no-positive', tabindexNoPositive, {
      valid: [],
      invalid: [
        {
          code: '<div tabIndex={1}>Content</div>',
          errors: [{
            messageId: 'noPositiveTabindex',
            suggestions: [{
              desc: 'Change to tabindex="0" (focusable in DOM order)',
              output: ''
            }]
          }]
        }
      ]
    })
  })
})

describe('tabindex-no-positive rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue elements with valid tabindex', () => {
    vueRuleTester.run('tabindex-no-positive', tabindexNoPositive, {
      valid: [
        { code: '<template><div tabindex="0">Focusable</div></template>' },
        { code: '<template><div tabindex="-1">Programmatic</div></template>' },
        { code: '<template><button>Click</button></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue elements with positive tabindex', () => {
    vueRuleTester.run('tabindex-no-positive', tabindexNoPositive, {
      valid: [],
      invalid: [
        {
          code: '<template><div tabindex="1">Content</div></template>',
          errors: [{ messageId: 'noPositiveTabindex', data: { value: '1' } }]
        },
        {
          code: '<template><input tabindex="5" /></template>',
          errors: [{ messageId: 'noPositiveTabindex', data: { value: '5' } }]
        }
      ]
    })
  })
})
