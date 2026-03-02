import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const noAccessKey = getRule('no-access-key')

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

describe('no-access-key rule - JSX', () => {
  it('should pass for elements without accesskey', () => {
    ruleTester.run('no-access-key', noAccessKey, {
      valid: [
        { code: '<button>Click me</button>' },
        { code: '<a href="/page">Link</a>' },
        { code: '<input type="text" />' },
        { code: '<div tabIndex={0}>Focusable</div>' }
      ],
      invalid: []
    })
  })

  it('should fail for elements with accesskey attribute', () => {
    ruleTester.run('no-access-key', noAccessKey, {
      valid: [],
      invalid: [
        {
          code: '<button accessKey="s">Save</button>',
          errors: [{ messageId: 'noAccessKey' }]
        },
        {
          code: '<a href="/page" accessKey="h">Home</a>',
          errors: [{ messageId: 'noAccessKey' }]
        },
        {
          code: '<input accesskey="f" type="text" />',
          errors: [{ messageId: 'noAccessKey' }]
        },
        {
          code: '<div accessKey={key}>Content</div>',
          errors: [{ messageId: 'noAccessKey' }]
        }
      ]
    })
  })

  it('should provide suggestion to remove accesskey', () => {
    ruleTester.run('no-access-key', noAccessKey, {
      valid: [],
      invalid: [
        {
          code: '<button accessKey="s">Save</button>',
          errors: [{
            messageId: 'noAccessKey',
            suggestions: [{
              desc: 'Remove accesskey attribute',
              output: ''
            }]
          }]
        }
      ]
    })
  })
})

describe('no-access-key rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue elements without accesskey', () => {
    vueRuleTester.run('no-access-key', noAccessKey, {
      valid: [
        { code: '<template><button>Click me</button></template>' },
        { code: '<template><a href="/page">Link</a></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue elements with accesskey', () => {
    vueRuleTester.run('no-access-key', noAccessKey, {
      valid: [],
      invalid: [
        {
          code: '<template><button accesskey="s">Save</button></template>',
          errors: [{ messageId: 'noAccessKey' }]
        }
      ]
    })
  })
})
