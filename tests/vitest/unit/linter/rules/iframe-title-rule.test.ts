import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { iframeTitle } from './rule-test-helper'

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

describe('iframe-title rule - JSX', () => {
  it('should pass for iframe with title attribute', () => {
    ruleTester.run('iframe-title', iframeTitle, {
      valid: [
        {
          code: '<iframe src="about:blank" title="Embedded content" />'
        },
        {
          code: '<iframe src="video.html" title="Video player" />'
        },
        {
          code: 'const Frame = () => <iframe src="test.html" title="Test frame" />'
        }
      ],
      invalid: []
    })
  })

  it('should fail for iframe without title attribute', () => {
    ruleTester.run('iframe-title', iframeTitle, {
      valid: [],
      invalid: [
        {
          code: '<iframe src="about:blank" />',
          errors: [
            {
              messageId: 'missingTitle'
            }
          ]
        },
        {
          code: 'const Frame = () => <iframe src="test.html" />',
          errors: [
            {
              messageId: 'missingTitle'
            }
          ]
        }
      ]
    })
  })

  it('should fail for iframe with empty title attribute', () => {
    ruleTester.run('iframe-title', iframeTitle, {
      valid: [],
      invalid: [
        {
          code: '<iframe src="about:blank" title="" />',
          errors: [
            {
              messageId: 'emptyTitle'
            }
          ]
        }
      ]
    })
  })

  it('should warn for dynamic title attribute', () => {
    ruleTester.run('iframe-title', iframeTitle, {
      valid: [],
      invalid: [
        {
          code: '<iframe src="test.html" title={frameTitle} />',
          errors: [
            {
              messageId: 'dynamicTitle'
            }
          ]
        }
      ]
    })
  })
})

describe('iframe-title rule - HTML strings', () => {
  const htmlRuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for HTML string with title', () => {
    htmlRuleTester.run('iframe-title', iframeTitle, {
      valid: [
        {
          code: 'const html = "<iframe src=\\"test.html\\" title=\\"Frame\\" />"'
        }
      ],
      invalid: []
    })
  })

  it('should fail for HTML string without title', () => {
    htmlRuleTester.run('iframe-title', iframeTitle, {
      valid: [],
      invalid: [
        {
          code: 'const html = "<iframe src=\\"test.html\\" />"',
          errors: [
            {
              messageId: 'missingTitle'
            }
          ]
        }
      ]
    })
  })
})

describe('iframe-title rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue iframe with title', () => {
    vueRuleTester.run('iframe-title', iframeTitle, {
      valid: [
        {
          code: '<template><iframe src="test.html" title="Embedded content" /></template>'
        }
      ],
      invalid: []
    })
  })

  it('should fail for Vue iframe without title', () => {
    vueRuleTester.run('iframe-title', iframeTitle, {
      valid: [],
      invalid: [
        {
          code: '<template><iframe src="test.html" /></template>',
          errors: [
            {
              messageId: 'missingTitle',
              suggestions: [
                {
                  desc: 'Add title attribute placeholder',
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

describe('iframe-title rule - suggestions', () => {
  it('should provide suggestion to add title attribute', () => {
    ruleTester.run('iframe-title', iframeTitle, {
      valid: [],
      invalid: [
        {
          code: '<iframe src="/page.html" />',
          errors: [
            {
              messageId: 'missingTitle',
              suggestions: [
                {
                  desc: 'Add title attribute placeholder',
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

