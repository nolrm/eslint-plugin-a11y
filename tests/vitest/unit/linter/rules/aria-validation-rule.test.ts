import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pluginPath = join(process.cwd(), 'dist/linter/eslint-plugin/index.js')
const eslintPlugin = require(pluginPath).default
const ariaValidation = eslintPlugin.rules['aria-validation']

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

describe('aria-validation rule - JSX', () => {
  it('should pass for valid ARIA role', () => {
    ruleTester.run('aria-validation', ariaValidation, {
      valid: [
        {
          code: '<div role="button">Click me</div>'
        },
        {
          code: '<div role="dialog" aria-label="Modal">Content</div>'
        }
      ],
      invalid: []
    })
  })

  it('should fail for invalid ARIA role', () => {
    ruleTester.run('aria-validation', ariaValidation, {
      valid: [],
      invalid: [
        {
          code: '<div role="invalid-role">Content</div>',
          errors: [
            {
              messageId: 'ariaViolation'
            }
          ]
        }
      ]
    })
  })

  it('should warn for redundant role', () => {
    ruleTester.run('aria-validation', ariaValidation, {
      valid: [],
      invalid: [
        {
          code: '<button role="button">Click</button>',
          errors: [
            {
              messageId: 'ariaViolation'
            }
          ]
        }
      ]
    })
  })

  it('should validate ARIA property values', () => {
    ruleTester.run('aria-validation', ariaValidation, {
      valid: [],
      invalid: [
        {
          code: '<div aria-required="maybe">Content</div>',
          errors: [
            {
              messageId: 'ariaViolation'
            }
          ]
        }
      ]
    })
  })

  it('should validate ID references', () => {
    ruleTester.run('aria-validation', ariaValidation, {
      valid: [
        {
          code: '<label id="email-label">Email</label><input aria-labelledby="email-label" />'
        }
      ],
      invalid: [
        {
          code: '<input aria-labelledby="missing-id" />',
          errors: [
            {
              messageId: 'ariaViolation'
            }
          ]
        }
      ]
    })
  })

  describe('role-has-required-aria-props', () => {
    it('should pass when a role\'s required property is present', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: '<div role="checkbox" aria-checked="true">Check</div>' },
          { code: '<div role="radio" aria-checked="false">Radio</div>' },
          { code: '<div role="switch" aria-checked="true">Switch</div>' },
          { code: '<li role="menuitemcheckbox" aria-checked="true">Item</li>' },
          { code: '<li role="menuitemradio" aria-checked="false">Item</li>' },
          { code: '<div role="combobox" aria-expanded="false">Combo</div>' },
          { code: '<div role="slider" aria-valuenow="5">Slider</div>' },
          { code: '<div role="heading" aria-level="2">Heading</div>' },
          {
            code: '<div id="content">Body</div><div role="scrollbar" aria-controls="content" aria-valuenow="50">Track</div>'
          }
        ],
        invalid: []
      })
    })

    it('should fail when a role\'s required property is missing', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [],
        invalid: [
          {
            code: '<div role="checkbox">Check</div>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<div role="radio">Radio</div>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<div role="switch">Switch</div>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<li role="menuitemcheckbox">Item</li>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<li role="menuitemradio">Item</li>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<div role="combobox">Combo</div>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<div role="slider">Slider</div>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<div role="heading">Heading</div>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            // Missing aria-valuenow only (aria-controls present and resolvable)
            code: '<div id="content">Body</div><div role="scrollbar" aria-controls="content">Track</div>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            // Missing both required properties -> one report per missing property
            code: '<div role="scrollbar">Track</div>',
            errors: [{ messageId: 'ariaViolation' }, { messageId: 'ariaViolation' }]
          }
        ]
      })
    })

    it('should not require aria-level for role="heading" on a native h1-h6 element', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [],
        invalid: [
          {
            // Only the existing "redundant role" warning applies here, not a missing
            // aria-level report - the level is implicit from the native <h2> tag.
            code: '<h2 role="heading">Heading</h2>',
            errors: [{ messageId: 'ariaViolation' }]
          }
        ]
      })
    })

    it('should not flag roles with no required properties (no-op)', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: '<a role="button">Click</a>' },
          { code: '<div role="link">Link</div>' },
          { code: '<img role="img" src="x.png" />' }
        ],
        invalid: []
      })
    })

    it('should not validate required properties when the role is dynamic', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: 'const role = "checkbox"; <div role={role}>Check</div>' }
        ],
        invalid: []
      })
    })

    it('should count a dynamic aria-checked value as present', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: 'const checked = true; <div role="checkbox" aria-checked={checked}>Check</div>' }
        ],
        invalid: []
      })
    })
  })

  describe('aria-unsupported-elements', () => {
    it('should pass for unsupported elements with no role/aria attributes', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: '<meta name="description" content="x" />' },
          { code: '<head><meta charSet="utf-8" /></head>' }
        ],
        invalid: []
      })
    })

    it('should pass for normal elements with role/aria attributes', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: '<div role="alert" aria-live="polite">Content</div>' }
        ],
        invalid: []
      })
    })

    it('should fail for role/aria-* attributes on unsupported elements', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [],
        invalid: [
          {
            code: '<meta aria-label="x" />',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<title role="presentation">Title</title>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<html aria-label="x"><body /></html>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            // Dynamic aria-* value still counts as a violation on unsupported elements.
            code: 'const label = "x"; <meta aria-label={label} />',
            errors: [{ messageId: 'ariaViolation' }]
          }
        ]
      })
    })

    it('should report one violation per offending attribute', () => {
      ruleTester.run('aria-validation', ariaValidation, {
        valid: [],
        invalid: [
          {
            // role + 2 aria-* attributes -> 3 reports
            code: '<base role="presentation" aria-hidden="true" aria-label="x" />',
            errors: [
              { messageId: 'ariaViolation' },
              { messageId: 'ariaViolation' },
              { messageId: 'ariaViolation' }
            ]
          }
        ]
      })
    })
  })
})

describe('aria-validation rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  describe('role-has-required-aria-props', () => {
    it('should pass when a role\'s required property is present', () => {
      vueRuleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: '<template><div role="checkbox" aria-checked="true">Check</div></template>' },
          {
            code: '<template><div id="content">Body</div><div role="scrollbar" aria-controls="content" aria-valuenow="50">Track</div></template>'
          }
        ],
        invalid: []
      })
    })

    it('should fail when a role\'s required property is missing', () => {
      vueRuleTester.run('aria-validation', ariaValidation, {
        valid: [],
        invalid: [
          {
            code: '<template><div role="checkbox">Check</div></template>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<template><div role="scrollbar">Track</div></template>',
            errors: [{ messageId: 'ariaViolation' }, { messageId: 'ariaViolation' }]
          }
        ]
      })
    })

    it('should not flag roles with no required properties (no-op)', () => {
      vueRuleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: '<template><a role="button">Click</a></template>' }
        ],
        invalid: []
      })
    })
  })

  describe('aria-unsupported-elements', () => {
    it('should pass for unsupported elements with no role/aria attributes', () => {
      vueRuleTester.run('aria-validation', ariaValidation, {
        valid: [
          { code: '<template><meta name="description" content="x" /></template>' }
        ],
        invalid: []
      })
    })

    it('should fail for role/aria-* attributes on unsupported elements', () => {
      vueRuleTester.run('aria-validation', ariaValidation, {
        valid: [],
        invalid: [
          {
            code: '<template><meta :aria-label="label" /></template>',
            errors: [{ messageId: 'ariaViolation' }]
          },
          {
            code: '<template><title role="presentation">Title</title></template>',
            errors: [{ messageId: 'ariaViolation' }]
          }
        ]
      })
    })

    it('should report one violation per offending attribute', () => {
      vueRuleTester.run('aria-validation', ariaValidation, {
        valid: [],
        invalid: [
          {
            code: '<template><base role="presentation" aria-hidden="true" aria-label="x" /></template>',
            errors: [
              { messageId: 'ariaViolation' },
              { messageId: 'ariaViolation' },
              { messageId: 'ariaViolation' }
            ]
          }
        ]
      })
    })
  })
})
