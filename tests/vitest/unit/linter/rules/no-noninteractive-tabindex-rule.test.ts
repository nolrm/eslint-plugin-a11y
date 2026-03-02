import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const noNoninteractiveTabindex = getRule('no-noninteractive-tabindex')

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

describe('no-noninteractive-tabindex rule - JSX', () => {
  it('should pass for interactive elements with tabindex', () => {
    ruleTester.run('no-noninteractive-tabindex', noNoninteractiveTabindex, {
      valid: [
        { code: '<button tabIndex={0}>Click</button>' },
        { code: '<a href="/page" tabIndex={0}>Link</a>' },
        { code: '<input tabIndex={0} type="text" />' }
      ],
      invalid: []
    })
  })

  it('should pass for non-interactive elements with tabindex=-1', () => {
    ruleTester.run('no-noninteractive-tabindex', noNoninteractiveTabindex, {
      valid: [
        { code: '<div tabIndex={-1}>Content</div>' },
        { code: '<p tabIndex="-1">Paragraph</p>' },
        { code: '<h1 tabIndex={-1}>Heading</h1>' }
      ],
      invalid: []
    })
  })

  it('should pass for non-interactive elements with interactive role and tabindex', () => {
    ruleTester.run('no-noninteractive-tabindex', noNoninteractiveTabindex, {
      valid: [
        { code: '<div role="button" tabIndex={0}>Custom button</div>' },
        { code: '<span role="link" tabIndex={0}>Custom link</span>' },
        { code: '<div role="checkbox" tabIndex={0}>Custom checkbox</div>' }
      ],
      invalid: []
    })
  })

  it('should fail for non-interactive elements with positive tabindex', () => {
    ruleTester.run('no-noninteractive-tabindex', noNoninteractiveTabindex, {
      valid: [],
      invalid: [
        {
          code: '<div tabIndex={0}>Content</div>',
          errors: [{ messageId: 'noNonInteractiveTabindex', data: { element: 'div' } }]
        },
        {
          code: '<p tabIndex={0}>Paragraph</p>',
          errors: [{ messageId: 'noNonInteractiveTabindex', data: { element: 'p' } }]
        },
        {
          code: '<h1 tabIndex={0}>Heading</h1>',
          errors: [{ messageId: 'noNonInteractiveTabindex', data: { element: 'h1' } }]
        },
        {
          code: '<span tabIndex="0">Text</span>',
          errors: [{ messageId: 'noNonInteractiveTabindex', data: { element: 'span' } }]
        }
      ]
    })
  })

  it('should provide suggestion to remove tabindex', () => {
    ruleTester.run('no-noninteractive-tabindex', noNoninteractiveTabindex, {
      valid: [],
      invalid: [
        {
          code: '<div tabIndex={0}>Content</div>',
          errors: [{
            messageId: 'noNonInteractiveTabindex',
            suggestions: [{
              desc: 'Remove tabindex attribute',
              output: ''
            }]
          }]
        }
      ]
    })
  })
})

describe('no-noninteractive-tabindex rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue non-interactive elements with tabindex=-1', () => {
    vueRuleTester.run('no-noninteractive-tabindex', noNoninteractiveTabindex, {
      valid: [
        { code: '<template><div tabindex="-1">Content</div></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue non-interactive elements with tabindex=0', () => {
    vueRuleTester.run('no-noninteractive-tabindex', noNoninteractiveTabindex, {
      valid: [],
      invalid: [
        {
          code: '<template><div tabindex="0">Content</div></template>',
          errors: [{ messageId: 'noNonInteractiveTabindex', data: { element: 'div' } }]
        }
      ]
    })
  })
})
