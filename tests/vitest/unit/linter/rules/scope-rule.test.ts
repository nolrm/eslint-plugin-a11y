import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { scope } from './rule-test-helper'

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

describe('scope rule - JSX', () => {
  it('1. should pass for th with valid scope values', () => {
    ruleTester.run('scope', scope, {
      valid: [
        { code: '<th scope="col">Column header</th>' },
        { code: '<th scope="row">Row header</th>' },
        { code: '<th scope="colgroup">Column group header</th>' },
        { code: '<th scope="rowgroup">Row group header</th>' }
      ],
      invalid: []
    })
  })

  it('2. should pass for th without scope attribute', () => {
    ruleTester.run('scope', scope, {
      valid: [
        { code: '<th>Header</th>' },
        { code: '<td>Cell</td>' }
      ],
      invalid: []
    })
  })

  it('3. should fail for th with invalid scope value', () => {
    ruleTester.run('scope', scope, {
      valid: [],
      invalid: [
        {
          code: '<th scope="invalid">Header</th>',
          errors: [{ messageId: 'invalidValue' }]
        },
        {
          code: '<th scope="column">Header</th>',
          errors: [{ messageId: 'invalidValue' }]
        },
        {
          code: '<th scope="auto">Header</th>',
          errors: [{ messageId: 'invalidValue' }]
        }
      ]
    })
  })

  it('4. should fail for td with scope attribute (invalid element)', () => {
    ruleTester.run('scope', scope, {
      valid: [],
      invalid: [
        {
          code: '<td scope="col">Cell</td>',
          errors: [{ messageId: 'invalidElement' }]
        },
        {
          code: '<td scope="row">Cell</td>',
          errors: [{ messageId: 'invalidElement' }]
        }
      ]
    })
  })

  it('5. should fail for non-table elements with scope attribute', () => {
    ruleTester.run('scope', scope, {
      valid: [],
      invalid: [
        {
          code: '<div scope="col">Not a table cell</div>',
          errors: [{ messageId: 'invalidElement' }]
        }
      ]
    })
  })

  it('6. should offer suggestion to remove scope on invalid element', () => {
    ruleTester.run('scope', scope, {
      valid: [],
      invalid: [
        {
          code: '<td scope="col">Cell</td>',
          errors: [{
            messageId: 'invalidElement',
            suggestions: [
              { desc: 'Remove the scope attribute', output: '' }
            ]
          }]
        }
      ]
    })
  })

  it('7. should offer suggestion to remove scope on invalid value', () => {
    ruleTester.run('scope', scope, {
      valid: [],
      invalid: [
        {
          code: '<th scope="invalid">Header</th>',
          errors: [{
            messageId: 'invalidValue',
            suggestions: [
              { desc: 'Remove the scope attribute', output: '' }
            ]
          }]
        }
      ]
    })
  })
})
