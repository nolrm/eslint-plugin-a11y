import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { noInteractiveElementToNoninteractiveRole } from './rule-test-helper'

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

describe('no-interactive-element-to-noninteractive-role rule - JSX', () => {
  it('1. should pass for non-interactive elements with role=none/presentation', () => {
    ruleTester.run('no-interactive-element-to-noninteractive-role', noInteractiveElementToNoninteractiveRole, {
      valid: [
        { code: '<div role="none">Container</div>' },
        { code: '<span role="presentation">Decorative</span>' },
        { code: '<p role="none">Text</p>' }
      ],
      invalid: []
    })
  })

  it('2. should pass for anchor without href (not interactive)', () => {
    ruleTester.run('no-interactive-element-to-noninteractive-role', noInteractiveElementToNoninteractiveRole, {
      valid: [
        { code: '<a role="none">No href anchor</a>' }
      ],
      invalid: []
    })
  })

  it('3. should fail for button with role=presentation', () => {
    ruleTester.run('no-interactive-element-to-noninteractive-role', noInteractiveElementToNoninteractiveRole, {
      valid: [],
      invalid: [
        {
          code: '<button role="presentation">Click</button>',
          errors: [{ messageId: 'noInteractiveToNoninteractive' }]
        },
        {
          code: '<button role="none">Submit</button>',
          errors: [{ messageId: 'noInteractiveToNoninteractive' }]
        }
      ]
    })
  })

  it('4. should fail for anchor with href and role=none', () => {
    ruleTester.run('no-interactive-element-to-noninteractive-role', noInteractiveElementToNoninteractiveRole, {
      valid: [],
      invalid: [
        {
          code: '<a href="/home" role="none">Home</a>',
          errors: [{ messageId: 'noInteractiveToNoninteractive' }]
        },
        {
          code: '<a href="/about" role="presentation">About</a>',
          errors: [{ messageId: 'noInteractiveToNoninteractive' }]
        }
      ]
    })
  })
})
