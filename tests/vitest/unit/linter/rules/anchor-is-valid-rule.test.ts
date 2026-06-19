import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { anchorIsValid } from './rule-test-helper'

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

describe('anchor-is-valid rule - JSX', () => {
  it('1. should pass for anchor with valid href', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        { code: '<a href="/home">Home</a>' },
        { code: '<a href="https://example.com">External</a>' },
        { code: '<a href="/about">About us</a>' }
      ],
      invalid: []
    })
  })

  it('2. should fail for anchor with missing href', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<a>Click me</a>',
          errors: [{ messageId: 'missingHref' }]
        },
        {
          code: '<a className="link">Label</a>',
          errors: [{ messageId: 'missingHref' }]
        }
      ]
    })
  })

  it('3. should fail for anchor with invalid href values', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<a href="#">Link</a>',
          errors: [{ messageId: 'invalidHref' }]
        },
        {
          code: '<a href="">Link</a>',
          errors: [{ messageId: 'invalidHref' }]
        },
        {
          code: '<a href="javascript:void(0)">Click</a>',
          errors: [{ messageId: 'invalidHref' }]
        }
      ]
    })
  })

  it('4. should fail with preferButton when onClick present but no href', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<a onClick={handleClick}>Action</a>',
          errors: [{ messageId: 'preferButton' }]
        }
      ]
    })
  })
})
