import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { linkText } from './rule-test-helper'

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

describe('link-text rule - JSX', () => {
  it('should pass for link with descriptive text', () => {
    ruleTester.run('link-text', linkText, {
      valid: [
        {
          code: '<a href="/about">About Us</a>'
        },
        {
          code: '<a href="/contact" aria-label="Contact page">Contact</a>'
        },
        {
          code: '<a href="/blog">Read our blog</a>'
        }
      ],
      invalid: []
    })
  })

  it('should warn for link with non-descriptive text', () => {
    ruleTester.run('link-text', linkText, {
      valid: [],
      invalid: [
        {
          code: '<a href="/about">Click here</a>',
          errors: [
            {
              messageId: 'nonDescriptive'
            }
          ]
        },
        {
          code: '<a href="/more">Read more</a>',
          errors: [
            {
              messageId: 'nonDescriptive'
            }
          ]
        },
        {
          code: '<a href="/more">more</a>',
          errors: [
            {
              messageId: 'nonDescriptive'
            }
          ]
        }
      ]
    })
  })

  it('should fail for link without text', () => {
    ruleTester.run('link-text', linkText, {
      valid: [],
      invalid: [
        {
          code: '<a href="/about"></a>',
          errors: [
            {
              messageId: 'missingText'
            }
          ]
        }
      ]
    })
  })
})

describe('link-text rule - HTML strings', () => {
  const htmlRuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for HTML link with descriptive text', () => {
    htmlRuleTester.run('link-text', linkText, {
      valid: [
        {
          code: 'const html = "<a href=\\"/about\\">About Us</a>"'
        }
      ],
      invalid: []
    })
  })

  it('should warn for HTML link with non-descriptive text', () => {
    htmlRuleTester.run('link-text', linkText, {
      valid: [],
      invalid: [
        {
          code: 'const html = "<a href=\\"/about\\">Click here</a>"',
          errors: [
            {
              messageId: 'nonDescriptive'
            }
          ]
        }
      ]
    })
  })
})

describe('link-text rule - with options', () => {
  describe('custom denylist', () => {
    it('should use custom denylist', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<a href="/about">Click here</a>',
            options: [{
              denylist: ['learn more']
            }]
          }
        ],
        invalid: [
          {
            code: '<a href="/about">Learn more</a>',
            options: [{
              denylist: ['learn more']
            }],
            errors: [{ messageId: 'nonDescriptive' }]
          }
        ]
      })
    })
  })

  describe('case insensitive', () => {
    it('should match denylist case-insensitively by default', () => {
      ruleTester.run('link-text', linkText, {
        valid: [],
        invalid: [
          {
            code: '<a href="/about">CLICK HERE</a>',
            errors: [{ messageId: 'nonDescriptive' }]
          },
          {
            code: '<a href="/about">Click Here</a>',
            errors: [{ messageId: 'nonDescriptive' }]
          }
        ]
      })
    })

    it('should respect caseInsensitive: false option', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<a href="/about">CLICK HERE</a>',
            options: [{
              caseInsensitive: false
            }]
          }
        ],
        invalid: [
          {
            code: '<a href="/about">click here</a>',
            options: [{
              caseInsensitive: false
            }],
            errors: [{ messageId: 'nonDescriptive' }]
          }
        ]
      })
    })
  })

  describe('accessible name sources', () => {
    it('should check aria-label', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<a href="/about" aria-label="About our company">Click here</a>'
          }
        ],
        invalid: [
          {
            code: '<a href="/about" aria-label="Click here">Link</a>',
            errors: [{ messageId: 'nonDescriptive' }]
          }
        ]
      })
    })

    it('should check aria-labelledby', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<span id="link-label">About Us</span><a href="/about" aria-labelledby="link-label">Click here</a>'
          }
        ],
        invalid: []
      })
    })
  })
})

describe('link-text rule - suggestions', () => {
  it('should provide suggestion to replace denylist text', () => {
    ruleTester.run('link-text', linkText, {
      valid: [],
      invalid: [
        {
          code: '<a href="/about">Click here</a>',
          errors: [
            {
              messageId: 'nonDescriptive',
              suggestions: [
                {
                  desc: 'Replace with descriptive text placeholder',
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
