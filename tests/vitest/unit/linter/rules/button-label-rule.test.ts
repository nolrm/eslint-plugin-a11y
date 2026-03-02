import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { buttonLabel } from './rule-test-helper'

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

describe('button-label rule - JSX', () => {
  it('should pass for button with text content', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [
        {
          code: '<button>Click me</button>'
        },
        {
          code: '<button>Submit</button>'
        },
        {
          code: 'const Button = () => <button>Click</button>'
        }
      ],
      invalid: []
    })
  })

  it('should pass for button with aria-label', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [
        {
          code: '<button aria-label="Close menu"></button>'
        },
        {
          code: '<button aria-label="Submit form"></button>'
        }
      ],
      invalid: []
    })
  })

  it('should fail for button without label', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [],
      invalid: [
        {
          code: '<button></button>',
          errors: [
            {
              messageId: 'missingLabel'
            }
          ]
        },
        {
          code: '<button><span></span></button>',
          errors: [
            {
              messageId: 'missingLabel'
            }
          ]
        }
      ]
    })
  })
})

describe('button-label rule - HTML strings', () => {
  const htmlRuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for HTML button with text', () => {
    htmlRuleTester.run('button-label', buttonLabel, {
      valid: [
        {
          code: 'const html = "<button>Click me</button>"'
        }
      ],
      invalid: []
    })
  })

  it('should fail for HTML button without label', () => {
    htmlRuleTester.run('button-label', buttonLabel, {
      valid: [],
      invalid: [
        {
          code: 'const html = "<button></button>"',
          errors: [
            {
              messageId: 'missingLabel'
            }
          ]
        }
      ]
    })
  })
})

describe('button-label rule - suggestions', () => {
  it('should provide suggestion to add aria-label for icon-only button', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [],
      invalid: [
        {
          code: '<button></button>',
          errors: [
            {
              messageId: 'missingLabel',
              suggestions: [
                {
                  desc: 'Add aria-label attribute for icon-only button',
                  output: ''
                }
              ]
            }
          ]
        }
      ]
    })
  })
})
