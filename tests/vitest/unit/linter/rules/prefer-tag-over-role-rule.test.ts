import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { preferTagOverRole } from './rule-test-helper'

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

describe('prefer-tag-over-role rule - JSX', () => {
  it('1. should pass for native semantic elements with matching role (not generic)', () => {
    ruleTester.run('prefer-tag-over-role', preferTagOverRole, {
      valid: [
        { code: '<button role="button">Click</button>' },
        { code: '<nav role="navigation">Links</nav>' },
        { code: '<main role="main">Content</main>' }
      ],
      invalid: []
    })
  })

  it('2. should pass for generic elements without a role', () => {
    ruleTester.run('prefer-tag-over-role', preferTagOverRole, {
      valid: [
        { code: '<div>Container</div>' },
        { code: '<span>Text</span>' },
        { code: '<p>Paragraph</p>' }
      ],
      invalid: []
    })
  })

  it('3. should pass for roles not in the ROLE_TO_TAG map', () => {
    ruleTester.run('prefer-tag-over-role', preferTagOverRole, {
      valid: [
        { code: '<div role="grid">Grid</div>' },
        { code: '<div role="treegrid">Tree</div>' }
      ],
      invalid: []
    })
  })

  it('4. should fail for div with role=button', () => {
    ruleTester.run('prefer-tag-over-role', preferTagOverRole, {
      valid: [],
      invalid: [
        {
          code: '<div role="button">Click me</div>',
          errors: [{ messageId: 'preferTag' }]
        }
      ]
    })
  })

  it('5. should fail for span and div with semantic roles', () => {
    ruleTester.run('prefer-tag-over-role', preferTagOverRole, {
      valid: [],
      invalid: [
        {
          code: '<span role="link">Link text</span>',
          errors: [{ messageId: 'preferTag' }]
        },
        {
          code: '<div role="navigation">Nav</div>',
          errors: [{ messageId: 'preferTag' }]
        },
        {
          code: '<div role="main">Main content</div>',
          errors: [{ messageId: 'preferTag' }]
        }
      ]
    })
  })
})
