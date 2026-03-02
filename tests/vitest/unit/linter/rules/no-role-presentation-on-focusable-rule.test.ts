import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const noRolePresentationOnFocusable = getRule('no-role-presentation-on-focusable')

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

describe('no-role-presentation-on-focusable rule - JSX', () => {
  it('should pass for non-focusable elements with role="presentation"', () => {
    ruleTester.run('no-role-presentation-on-focusable', noRolePresentationOnFocusable, {
      valid: [
        { code: '<div role="presentation">Content</div>' },
        { code: '<span role="none">Text</span>' },
        { code: '<table role="presentation"><tr><td>Cell</td></tr></table>' },
        { code: '<img role="presentation" src="decorative.png" alt="" />' }
      ],
      invalid: []
    })
  })

  it('should pass for focusable elements without presentation role', () => {
    ruleTester.run('no-role-presentation-on-focusable', noRolePresentationOnFocusable, {
      valid: [
        { code: '<button>Click me</button>' },
        { code: '<a href="/page">Link</a>' },
        { code: '<button role="tab">Tab</button>' },
        { code: '<div tabIndex={0} role="button">Custom button</div>' }
      ],
      invalid: []
    })
  })

  it('should fail for focusable elements with role="presentation"', () => {
    ruleTester.run('no-role-presentation-on-focusable', noRolePresentationOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<button role="presentation">Click me</button>',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'presentation' } }]
        },
        {
          code: '<a href="/page" role="presentation">Link</a>',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'presentation' } }]
        },
        {
          code: '<input type="text" role="presentation" />',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'presentation' } }]
        },
        {
          code: '<div tabIndex={0} role="presentation">Focusable</div>',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'presentation' } }]
        }
      ]
    })
  })

  it('should fail for focusable elements with role="none"', () => {
    ruleTester.run('no-role-presentation-on-focusable', noRolePresentationOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<button role="none">Click me</button>',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'none' } }]
        },
        {
          code: '<a href="/page" role="none">Link</a>',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'none' } }]
        }
      ]
    })
  })

  it('should provide suggestions', () => {
    ruleTester.run('no-role-presentation-on-focusable', noRolePresentationOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<button role="presentation">Click me</button>',
          errors: [{
            messageId: 'noRolePresentationOnFocusable',
            suggestions: [
              { desc: 'Remove role attribute', output: '' },
              { desc: 'Add tabindex="-1" to make element non-focusable', output: '' }
            ]
          }]
        }
      ]
    })
  })
})

describe('no-role-presentation-on-focusable rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue non-focusable elements', () => {
    vueRuleTester.run('no-role-presentation-on-focusable', noRolePresentationOnFocusable, {
      valid: [
        { code: '<template><div role="presentation">Content</div></template>' },
        { code: '<template><span role="none">Text</span></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue focusable elements with presentation role', () => {
    vueRuleTester.run('no-role-presentation-on-focusable', noRolePresentationOnFocusable, {
      valid: [],
      invalid: [
        {
          code: '<template><button role="presentation">Click</button></template>',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'presentation' } }]
        },
        {
          code: '<template><a href="/page" role="none">Link</a></template>',
          errors: [{ messageId: 'noRolePresentationOnFocusable', data: { role: 'none' } }]
        }
      ]
    })
  })
})
