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

describe('anchor-is-valid rule - JSX specialLink option', () => {
  const linkSettings = { 'a11y': { components: { Link: 'a' } } }

  it('5. should pass when native href is present even if a specialLink prop is also set', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        {
          code: '<a href="/home" to="#">Home</a>',
          options: [{ specialLink: ['to'] }]
        }
      ],
      invalid: []
    })
  })

  it('6. should pass for a mapped Link component using a specialLink prop instead of href', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        {
          code: '<Link to="/home">Home</Link>',
          options: [{ specialLink: ['to'] }],
          settings: linkSettings
        }
      ],
      invalid: []
    })
  })

  it('7. should fail invalidHref for a mapped Link component with an invalid specialLink value', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<Link to="#">Home</Link>',
          options: [{ specialLink: ['to'] }],
          settings: linkSettings,
          errors: [{ messageId: 'invalidHref' }]
        }
      ]
    })
  })

  it('8. should fail missingHref for a mapped Link component with neither href nor specialLink props', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<Link>Home</Link>',
          options: [{ specialLink: ['to'] }],
          settings: linkSettings,
          errors: [{ messageId: 'missingHref' }]
        }
      ]
    })
  })

  it('9. should fail preferButton for a mapped Link component with onClick but neither href nor specialLink props', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<Link onClick={handleClick}>Home</Link>',
          options: [{ specialLink: ['to'] }],
          settings: linkSettings,
          errors: [{ messageId: 'preferButton' }]
        }
      ]
    })
  })
})

describe('anchor-is-valid rule - JSX aspects option', () => {
  it('10. should not report missingHref when the noHref aspect is disabled', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        {
          code: '<a>No link</a>',
          options: [{ aspects: ['invalidHref', 'preferButton'] }]
        }
      ],
      invalid: []
    })
  })

  it('11. should not report invalidHref when the invalidHref aspect is disabled', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        {
          code: '<a href="#">Bad</a>',
          options: [{ aspects: ['noHref', 'preferButton'] }]
        }
      ],
      invalid: []
    })
  })

  it('12. should fall back to missingHref when the preferButton aspect is disabled', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<a onClick={handleClick}>Action</a>',
          options: [{ aspects: ['noHref', 'invalidHref'] }],
          errors: [{ messageId: 'missingHref' }]
        }
      ]
    })
  })

  it('13. should not report anything when neither noHref nor preferButton aspects are enabled', () => {
    ruleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        {
          code: '<a onClick={handleClick}>Action</a>',
          options: [{ aspects: ['invalidHref'] }]
        }
      ],
      invalid: []
    })
  })
})

describe('anchor-is-valid rule - Vue', () => {
  const vueRuleTester = new RuleTester({
    parser: require.resolve('vue-eslint-parser'),
    parserOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  })

  it('14. should pass for anchor with valid href', () => {
    vueRuleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        { code: '<template><a href="/home">Home</a></template>' }
      ],
      invalid: []
    })
  })

  it('15. should fail for anchor with missing href', () => {
    vueRuleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<template><a>Click me</a></template>',
          errors: [{ messageId: 'missingHref' }]
        }
      ]
    })
  })

  it('16. should fail for anchor with invalid href values', () => {
    vueRuleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<template><a href="#">Link</a></template>',
          errors: [{ messageId: 'invalidHref' }]
        }
      ]
    })
  })

  it('17. should fail with preferButton when a click handler is present but no href', () => {
    vueRuleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<template><a @click="handleClick">Action</a></template>',
          errors: [{ messageId: 'preferButton' }]
        }
      ]
    })
  })

  it('18. should pass when a specialLink prop is present instead of href', () => {
    vueRuleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [
        {
          code: '<template><a to="/home">Home</a></template>',
          options: [{ specialLink: ['to'] }]
        }
      ],
      invalid: []
    })
  })

  it('19. should fail invalidHref when the specialLink prop value is invalid', () => {
    vueRuleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<template><a to="#">Home</a></template>',
          options: [{ specialLink: ['to'] }],
          errors: [{ messageId: 'invalidHref' }]
        }
      ]
    })
  })

  it('20. should fall back to missingHref when the preferButton aspect is disabled', () => {
    vueRuleTester.run('anchor-is-valid', anchorIsValid, {
      valid: [],
      invalid: [
        {
          code: '<template><a @click="handleClick">Action</a></template>',
          options: [{ aspects: ['noHref', 'invalidHref'] }],
          errors: [{ messageId: 'missingHref' }]
        }
      ]
    })
  })
})
