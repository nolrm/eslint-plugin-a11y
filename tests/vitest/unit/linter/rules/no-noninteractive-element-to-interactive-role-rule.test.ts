import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { noNoninteractiveElementToInteractiveRole } from './rule-test-helper'

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

describe('no-noninteractive-element-to-interactive-role rule - JSX', () => {
  it('1. should pass for non-interactive element with role=button AND tabIndex AND keyboard handler', () => {
    ruleTester.run('no-noninteractive-element-to-interactive-role', noNoninteractiveElementToInteractiveRole, {
      valid: [
        { code: '<div role="button" tabIndex={0} onKeyDown={() => {}}>Click</div>' },
        { code: '<span role="link" tabIndex={0} onKeyDown={() => {}}>Link text</span>' },
        { code: '<div role="checkbox" tabIndex={0} onKeyUp={() => {}} aria-checked="false">Check</div>' }
      ],
      invalid: []
    })
  })

  it('2. should pass for native interactive elements with interactive roles', () => {
    ruleTester.run('no-noninteractive-element-to-interactive-role', noNoninteractiveElementToInteractiveRole, {
      valid: [
        { code: '<button role="button">Click</button>' },
        { code: '<input role="textbox" type="text" />' }
      ],
      invalid: []
    })
  })

  it('3. should fail for h1 with role=button (no keyboard support)', () => {
    ruleTester.run('no-noninteractive-element-to-interactive-role', noNoninteractiveElementToInteractiveRole, {
      valid: [],
      invalid: [
        {
          code: '<h1 role="button">Heading</h1>',
          errors: [{ messageId: 'noNoninteractiveToInteractive' }]
        },
        {
          code: '<p role="link">Paragraph</p>',
          errors: [{ messageId: 'noNoninteractiveToInteractive' }]
        }
      ]
    })
  })

  it('4. should fail for div with role=button but missing tabIndex or keyboard handler', () => {
    ruleTester.run('no-noninteractive-element-to-interactive-role', noNoninteractiveElementToInteractiveRole, {
      valid: [],
      invalid: [
        {
          code: '<div role="button">Click</div>',
          errors: [{ messageId: 'noNoninteractiveToInteractive' }]
        },
        {
          code: '<div role="button" tabIndex={0}>No keyboard handler</div>',
          errors: [{ messageId: 'noNoninteractiveToInteractive' }]
        },
        {
          code: '<div role="button" onKeyDown={() => {}}>No tabindex</div>',
          errors: [{ messageId: 'noNoninteractiveToInteractive' }]
        }
      ]
    })
  })
})
