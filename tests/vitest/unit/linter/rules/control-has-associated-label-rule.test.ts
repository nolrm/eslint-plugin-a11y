import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { controlHasAssociatedLabel } from './rule-test-helper'

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

describe('control-has-associated-label rule - JSX', () => {
  it('1. should pass for ARIA-role element with aria-label', () => {
    ruleTester.run('control-has-associated-label', controlHasAssociatedLabel, {
      valid: [
        { code: '<div role="button" aria-label="Close">X</div>' },
        { code: '<span role="checkbox" aria-label="Accept terms" />' },
        { code: '<div role="listbox" aria-labelledby="list-label"></div>' }
      ],
      invalid: []
    })
  })

  it('2. should pass for ARIA-role element with text content', () => {
    ruleTester.run('control-has-associated-label', controlHasAssociatedLabel, {
      valid: [
        { code: '<div role="button">Submit form</div>' },
        { code: '<span role="tab">Profile</span>' },
        { code: '<div role="menuitem">Cut</div>' }
      ],
      invalid: []
    })
  })

  it('3. should pass for native interactive elements (covered by other rules)', () => {
    ruleTester.run('control-has-associated-label', controlHasAssociatedLabel, {
      valid: [
        { code: '<button></button>' },
        { code: '<input type="text" />' },
        { code: '<a href="/home">Link</a>' }
      ],
      invalid: []
    })
  })

  it('4. should fail for ARIA-role element without any accessible label', () => {
    ruleTester.run('control-has-associated-label', controlHasAssociatedLabel, {
      valid: [],
      invalid: [
        {
          code: '<div role="button"></div>',
          errors: [{ messageId: 'missingLabel' }]
        },
        {
          code: '<span role="checkbox"></span>',
          errors: [{ messageId: 'missingLabel' }]
        },
        {
          code: '<div role="textbox"></div>',
          errors: [{ messageId: 'missingLabel' }]
        }
      ]
    })
  })
})
