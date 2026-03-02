import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const noAutofocus = getRule('no-autofocus')

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

describe('no-autofocus rule - JSX', () => {
  it('should pass for elements without autofocus', () => {
    ruleTester.run('no-autofocus', noAutofocus, {
      valid: [
        { code: '<input type="text" />' },
        { code: '<button>Click me</button>' },
        { code: '<textarea placeholder="Enter text"></textarea>' },
        { code: '<select><option>One</option></select>' }
      ],
      invalid: []
    })
  })

  it('should fail for elements with autofocus attribute', () => {
    ruleTester.run('no-autofocus', noAutofocus, {
      valid: [],
      invalid: [
        {
          code: '<input autoFocus type="text" />',
          errors: [{ messageId: 'noAutofocus' }]
        },
        {
          code: '<input autofocus type="text" />',
          errors: [{ messageId: 'noAutofocus' }]
        },
        {
          code: '<button autoFocus>Click me</button>',
          errors: [{ messageId: 'noAutofocus' }]
        },
        {
          code: '<textarea autoFocus></textarea>',
          errors: [{ messageId: 'noAutofocus' }]
        }
      ]
    })
  })

  it('should provide suggestion to remove autofocus', () => {
    ruleTester.run('no-autofocus', noAutofocus, {
      valid: [],
      invalid: [
        {
          code: '<input autoFocus type="text" />',
          errors: [{
            messageId: 'noAutofocus',
            suggestions: [{
              desc: 'Remove autofocus attribute',
              output: ''
            }]
          }]
        }
      ]
    })
  })

  it('should allow ignoreNonDOM option', () => {
    ruleTester.run('no-autofocus', noAutofocus, {
      valid: [
        {
          code: '<CustomInput autoFocus />',
          options: [{ ignoreNonDOM: true }]
        },
        {
          code: '<MyComponent autoFocus />',
          options: [{ ignoreNonDOM: true }]
        }
      ],
      invalid: [
        {
          code: '<input autoFocus />',
          options: [{ ignoreNonDOM: true }],
          errors: [{ messageId: 'noAutofocus' }]
        }
      ]
    })
  })
})

describe('no-autofocus rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue elements without autofocus', () => {
    vueRuleTester.run('no-autofocus', noAutofocus, {
      valid: [
        { code: '<template><input type="text" /></template>' },
        { code: '<template><button>Click me</button></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue elements with autofocus', () => {
    vueRuleTester.run('no-autofocus', noAutofocus, {
      valid: [],
      invalid: [
        {
          code: '<template><input autofocus type="text" /></template>',
          errors: [{ messageId: 'noAutofocus' }]
        }
      ]
    })
  })
})
