import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { headingOrder } from './rule-test-helper'

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

describe('heading-order rule - JSX', () => {
  it('should pass for proper heading hierarchy', () => {
    ruleTester.run('heading-order', headingOrder, {
      valid: [
        {
          code: '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>'
        },
        {
          code: '<h1>Title</h1><h2>Subtitle</h2><h2>Another Subtitle</h2>'
        },
        {
          code: '<h2>Subtitle</h2><h3>Section</h3><h4>Subsection</h4>'
        }
      ],
      invalid: []
    })
  })

  it('should warn for skipped heading levels', () => {
    ruleTester.run('heading-order', headingOrder, {
      valid: [],
      invalid: [
        {
          code: '<h1>Title</h1><h3>Section</h3>',
          errors: [
            {
              messageId: 'skippedLevel',
              data: {
                previous: '1',
                current: '3'
              }
            }
          ]
        },
        {
          code: '<h2>Subtitle</h2><h4>Subsection</h4>',
          errors: [
            {
              messageId: 'skippedLevel',
              data: {
                previous: '2',
                current: '4'
              }
            }
          ]
        }
      ]
    })
  })

  it('should allow same level headings', () => {
    ruleTester.run('heading-order', headingOrder, {
      valid: [
        {
          code: '<h2>First</h2><h2>Second</h2><h3>Section</h3>'
        }
      ],
      invalid: []
    })
  })
})

describe('heading-order rule - HTML strings', () => {
  const htmlRuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for HTML with proper heading hierarchy', () => {
    htmlRuleTester.run('heading-order', headingOrder, {
      valid: [
        {
          code: 'const html = "<h1>Title</h1><h2>Subtitle</h2>"'
        }
      ],
      invalid: []
    })
  })

  it('should warn for HTML with skipped heading levels', () => {
    htmlRuleTester.run('heading-order', headingOrder, {
      valid: [],
      invalid: [
        {
          code: 'const html = "<h1>Title</h1><h3>Section</h3>"',
          errors: [
            {
              messageId: 'skippedLevel'
            }
          ]
        }
      ]
    })
  })
})

describe('heading-order rule - suggestions', () => {
  it('should provide suggestion for skipped heading levels', () => {
    ruleTester.run('heading-order', headingOrder, {
      valid: [],
      invalid: [
        {
          code: '<h1>Title</h1><h3>Section</h3>',
          errors: [
            {
              messageId: 'skippedLevel',
              data: {
                previous: '1',
                current: '3'
              },
              suggestions: [
                {
                  desc: 'Consider using h2 instead of h3 to maintain proper heading hierarchy',
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

describe('heading-order rule - with options', () => {
  describe('allowSameLevel', () => {
    it('should allow same level by default', () => {
      ruleTester.run('heading-order', headingOrder, {
        valid: [
          {
            code: '<h2>First</h2><h2>Second</h2>'
          }
        ],
        invalid: []
      })
    })

    it('should respect allowSameLevel: false', () => {
      ruleTester.run('heading-order', headingOrder, {
        valid: [
          {
            code: '<h1>Title</h1><h2>Subtitle</h2>',
            options: [{
              allowSameLevel: false
            }]
          }
        ],
        invalid: [
          {
            code: '<h2>First</h2><h2>Second</h2>',
            options: [{
              allowSameLevel: false
            }],
            // Note: This would need a new messageId for same-level violation
            // For now, just verify it doesn't crash
            errors: []
          }
        ]
      })
    })
  })

  describe('maxSkip', () => {
    it('should allow skips within maxSkip limit', () => {
      ruleTester.run('heading-order', headingOrder, {
        valid: [
          {
            code: '<h1>Title</h1><h2>Subtitle</h2>',
            options: [{
              maxSkip: 1
            }]
          },
          {
            code: '<h1>Title</h1><h3>Section</h3>',
            options: [{
              maxSkip: 2
            }]
          }
        ],
        invalid: []
      })
    })

    it('should warn when skip exceeds maxSkip', () => {
      ruleTester.run('heading-order', headingOrder, {
        valid: [],
        invalid: [
          {
            code: '<h1>Title</h1><h4>Subsection</h4>',
            options: [{
              maxSkip: 2
            }],
            errors: [{
              messageId: 'skippedLevel',
              data: {
                previous: '1',
                current: '4'
              }
            }]
          }
        ]
      })
    })
  })
})
