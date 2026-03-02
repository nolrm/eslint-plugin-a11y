import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const noAriaHiddenOnFocusable = getRule('no-aria-hidden-on-focusable')

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

describe('no-aria-hidden-on-focusable rule - JSX', () => {
  it('should pass for non-focusable elements with aria-hidden', () => {
    ruleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [
        { code: '<div aria-hidden="true">Hidden content</div>' },
        { code: '<span aria-hidden="true">Hidden</span>' },
        { code: '<p aria-hidden="true">Hidden paragraph</p>' },
        { code: '<div aria-hidden="true" tabIndex={-1}>Hidden and non-focusable</div>' }
      ],
      invalid: []
    })
  })

  it('should pass for focusable elements without aria-hidden', () => {
    ruleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [
        { code: '<button>Click me</button>' },
        { code: '<a href="/page">Link</a>' },
        { code: '<input type="text" />' },
        { code: '<div tabIndex={0}>Focusable</div>' }
      ],
      invalid: []
    })
  })

  it('should pass for aria-hidden="false"', () => {
    ruleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [
        { code: '<button aria-hidden="false">Click me</button>' },
        { code: '<a href="/page" aria-hidden="false">Link</a>' }
      ],
      invalid: []
    })
  })

  it('should fail for focusable elements with aria-hidden="true"', () => {
    ruleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<button aria-hidden="true">Click me</button>',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        },
        {
          code: '<a href="/page" aria-hidden="true">Link</a>',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        },
        {
          code: '<input type="text" aria-hidden="true" />',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        },
        {
          code: '<div tabIndex={0} aria-hidden="true">Focusable</div>',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        },
        {
          code: '<div tabIndex="0" aria-hidden="true">Focusable</div>',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        }
      ]
    })
  })

  it('should fail for JSX expression with true', () => {
    ruleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<button aria-hidden={true}>Click me</button>',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        }
      ]
    })
  })

  it('should provide suggestions', () => {
    ruleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<button aria-hidden="true">Click me</button>',
          errors: [{
            messageId: 'noAriaHiddenOnFocusable',
            suggestions: [
              { desc: 'Remove aria-hidden attribute', output: '' },
              { desc: 'Add tabindex="-1" to make element non-focusable', output: '' }
            ]
          }]
        }
      ]
    })
  })
})

describe('no-aria-hidden-on-focusable rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue non-focusable elements with aria-hidden', () => {
    vueRuleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [
        { code: '<template><div aria-hidden="true">Hidden</div></template>' },
        { code: '<template><span aria-hidden="true">Hidden</span></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue focusable elements with aria-hidden', () => {
    vueRuleTester.run('no-aria-hidden-on-focusable', noAriaHiddenOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<template><button aria-hidden="true">Click</button></template>',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        },
        {
          code: '<template><a href="/page" aria-hidden="true">Link</a></template>',
          errors: [{ messageId: 'noAriaHiddenOnFocusable' }]
        }
      ]
    })
  })
})
