import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { getRule } from './rule-test-helper'

const htmlHasLang = getRule('html-has-lang')

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

describe('html-has-lang rule - JSX', () => {
  it('should pass for html element with lang attribute', () => {
    ruleTester.run('html-has-lang', htmlHasLang, {
      valid: [
        { code: '<html lang="en"></html>' },
        { code: '<html lang="en-US"></html>' },
        { code: '<html lang="es"></html>' },
        { code: '<html lang="fr"></html>' },
        { code: '<html lang={language}></html>' }
      ],
      invalid: []
    })
  })

  it('should pass for non-html elements without lang', () => {
    ruleTester.run('html-has-lang', htmlHasLang, {
      valid: [
        { code: '<div>Content</div>' },
        { code: '<body>Content</body>' },
        { code: '<head><title>Title</title></head>' }
      ],
      invalid: []
    })
  })

  it('should fail for html element without lang attribute', () => {
    ruleTester.run('html-has-lang', htmlHasLang, {
      valid: [],
      invalid: [
        {
          code: '<html></html>',
          errors: [{ messageId: 'htmlMustHaveLang' }]
        },
        {
          code: '<html className="app"></html>',
          errors: [{ messageId: 'htmlMustHaveLang' }]
        }
      ]
    })
  })

  it('should provide suggestion to add lang attribute', () => {
    ruleTester.run('html-has-lang', htmlHasLang, {
      valid: [],
      invalid: [
        {
          code: '<html></html>',
          errors: [{
            messageId: 'htmlMustHaveLang',
            suggestions: [{
              desc: 'Add lang="en" attribute',
              output: ''
            }]
          }]
        }
      ]
    })
  })
})

describe('html-has-lang rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('should pass for Vue html with lang', () => {
    vueRuleTester.run('html-has-lang', htmlHasLang, {
      valid: [
        { code: '<template><html lang="en"></html></template>' }
      ],
      invalid: []
    })
  })

  it('should fail for Vue html without lang', () => {
    vueRuleTester.run('html-has-lang', htmlHasLang, {
      valid: [],
      invalid: [
        {
          code: '<template><html></html></template>',
          errors: [{ messageId: 'htmlMustHaveLang' }]
        }
      ]
    })
  })
})
