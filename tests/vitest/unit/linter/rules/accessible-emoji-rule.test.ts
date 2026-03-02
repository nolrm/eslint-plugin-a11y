import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const accessibleEmoji = getRule('accessible-emoji')

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

describe('accessible-emoji rule - JSX', () => {
  it('should pass for text without emoji', () => {
    ruleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [
        { code: '<span>Hello world</span>' },
        { code: '<span>No emoji here</span>' },
        { code: '<div>Regular content</div>' }
      ],
      invalid: []
    })
  })

  it('should pass for emoji with role="img" and aria-label', () => {
    ruleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [
        { code: '<span role="img" aria-label="smiling face">😀</span>' },
        { code: '<span role="img" aria-label="thumbs up">👍</span>' },
        { code: '<span role="img" aria-label="heart">❤️</span>' }
      ],
      invalid: []
    })
  })

  it('should pass for emoji with role="img" and aria-labelledby', () => {
    ruleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [
        { code: '<span role="img" aria-labelledby="emoji-desc">😀</span>' }
      ],
      invalid: []
    })
  })

  it('should fail for emoji without role="img"', () => {
    ruleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [],
      invalid: [
        {
          code: '<span aria-label="smiling face">😀</span>',
          errors: [{ messageId: 'emojiNeedsRole' }]
        }
      ]
    })
  })

  it('should fail for emoji without accessible label', () => {
    ruleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [],
      invalid: [
        {
          code: '<span role="img">😀</span>',
          errors: [{ messageId: 'emojiNeedsLabel' }]
        }
      ]
    })
  })

  it('should fail for emoji without both role and label', () => {
    ruleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [],
      invalid: [
        {
          code: '<span>😀</span>',
          errors: [
            { messageId: 'emojiNeedsRole' },
            { messageId: 'emojiNeedsLabel' }
          ]
        },
        {
          code: '<span>👍 Great job!</span>',
          errors: [
            { messageId: 'emojiNeedsRole' },
            { messageId: 'emojiNeedsLabel' }
          ]
        }
      ]
    })
  })

  it('should provide suggestions', () => {
    ruleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [],
      invalid: [
        {
          code: '<span>😀</span>',
          errors: [
            {
              messageId: 'emojiNeedsRole',
              suggestions: [{ desc: 'Add role="img"', output: '' }]
            },
            {
              messageId: 'emojiNeedsLabel',
              suggestions: [{ desc: 'Add aria-label', output: '' }]
            }
          ]
        }
      ]
    })
  })
})

describe('accessible-emoji rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue accessible emoji', () => {
    vueRuleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [
        { code: '<template><span role="img" aria-label="smile">😀</span></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue inaccessible emoji', () => {
    vueRuleTester.run('accessible-emoji', accessibleEmoji, {
      valid: [],
      invalid: [
        {
          code: '<template><span>😀</span></template>',
          errors: [
            { messageId: 'emojiNeedsRole' },
            { messageId: 'emojiNeedsLabel' }
          ]
        }
      ]
    })
  })
})
