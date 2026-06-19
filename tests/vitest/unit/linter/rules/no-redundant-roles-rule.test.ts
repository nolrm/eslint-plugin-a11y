import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { noRedundantRoles } from './rule-test-helper'

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

describe('no-redundant-roles rule - JSX', () => {
  it('1. should pass for elements with non-redundant explicit roles', () => {
    ruleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [
        { code: '<div role="button">Click</div>' },
        { code: '<nav role="banner">Header nav</nav>' },
        { code: '<ul role="menu">Menu items</ul>' }
      ],
      invalid: []
    })
  })

  it('2. should pass for section/form without accessible name (no implicit role)', () => {
    ruleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [
        { code: '<section role="region">Content</section>' },
        { code: '<form role="form">Form</form>' }
      ],
      invalid: []
    })
  })

  it('3. should pass for anchor with redundant role but no href (no implicit role)', () => {
    ruleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [
        { code: '<a role="link">No href anchor</a>' }
      ],
      invalid: []
    })
  })

  it('4. should fail for button with redundant role="button"', () => {
    ruleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [],
      invalid: [
        {
          code: '<button role="button">Submit</button>',
          errors: [{
            messageId: 'redundantRole',
            suggestions: [
              { desc: 'Remove redundant role="button"', output: '' }
            ]
          }]
        }
      ]
    })
  })

  it('5. should fail for nav with redundant role="navigation"', () => {
    ruleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [],
      invalid: [
        {
          code: '<nav role="navigation">Links</nav>',
          errors: [{
            messageId: 'redundantRole',
            suggestions: [
              { desc: 'Remove redundant role="navigation"', output: '' }
            ]
          }]
        }
      ]
    })
  })

  it('6. should fail for input type=checkbox with redundant role="checkbox"', () => {
    ruleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [],
      invalid: [
        {
          code: '<input type="checkbox" role="checkbox" />',
          errors: [{
            messageId: 'redundantRole',
            suggestions: [
              { desc: 'Remove redundant role="checkbox"', output: '' }
            ]
          }]
        }
      ]
    })
  })

  it('7. should fail for anchor with href and redundant role="link"', () => {
    ruleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [],
      invalid: [
        {
          code: '<a href="/page" role="link">Link</a>',
          errors: [{
            messageId: 'redundantRole',
            suggestions: [
              { desc: 'Remove redundant role="link"', output: '' }
            ]
          }]
        }
      ]
    })
  })
})

describe('no-redundant-roles rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('8. should pass for Vue elements with non-redundant roles', () => {
    vueRuleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [
        { code: '<template><div role="button">Click</div></template>' },
        { code: '<template><nav role="banner">Nav</nav></template>' }
      ],
      invalid: []
    })
  })

  it('9. should fail for Vue button with redundant role="button" and provide suggestion', () => {
    vueRuleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [],
      invalid: [
        {
          code: '<template><button role="button">Submit</button></template>',
          errors: [{
            messageId: 'redundantRole',
            suggestions: [
              { desc: 'Remove redundant role="button"', output: '' }
            ]
          }]
        }
      ]
    })
  })

  it('10. should fail for Vue nav with redundant role="navigation" and provide suggestion', () => {
    vueRuleTester.run('no-redundant-roles', noRedundantRoles, {
      valid: [],
      invalid: [
        {
          code: '<template><nav role="navigation">Links</nav></template>',
          errors: [{
            messageId: 'redundantRole',
            suggestions: [
              { desc: 'Remove redundant role="navigation"', output: '' }
            ]
          }]
        }
      ]
    })
  })
})
