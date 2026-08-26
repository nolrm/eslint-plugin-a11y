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

describe('button-label rule - custom component label props', () => {
  it('1. should pass for custom Button with static label prop (zero config)', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [
        {
          code: '<Button label="Cancel" />'
        },
        {
          code: '<Button label="Cancel"></Button>'
        }
      ],
      invalid: []
    })
  })

  it('2. should still fail for custom Button with no label prop and no children (default settings)', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [],
      invalid: [
        {
          code: '<Button />',
          errors: [{ messageId: 'missingLabel' }]
        },
        {
          code: '<Button></Button>',
          errors: [{ messageId: 'missingLabel' }]
        }
      ]
    })
  })

  it('3. should report dynamicLabel for dynamic label prop values', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [],
      invalid: [
        {
          code: '<Button label={cancelLabel} />',
          errors: [{ messageId: 'dynamicLabel' }]
        },
        {
          code: '<Button label={cancelLabel ?? defaultCancelLabel} />',
          errors: [{ messageId: 'dynamicLabel' }]
        }
      ]
    })
  })

  it('4. should not treat an empty string label prop as an accessible name', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [],
      invalid: [
        {
          code: '<Button label="" />',
          errors: [{ messageId: 'missingLabel' }]
        }
      ]
    })
  })

  it('5. should support a custom labelPropNames setting for non-default prop names', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [
        {
          code: '<Button text="Cancel" />',
          settings: { 'a11y': { labelPropNames: ['text'] } }
        }
      ],
      invalid: [
        {
          // "label" is no longer checked once labelPropNames is overridden
          code: '<Button label="Cancel" />',
          settings: { 'a11y': { labelPropNames: ['text'] } },
          errors: [{ messageId: 'missingLabel' }]
        }
      ]
    })
  })

  it('6. should not change native <button> behavior (label prop is JSX-custom-component-only)', () => {
    ruleTester.run('button-label', buttonLabel, {
      valid: [],
      invalid: [
        {
          // Native <button> never had a "label" prop convention - must still fail
          code: '<button label="Cancel"></button>',
          errors: [{ messageId: 'missingLabel' }]
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
