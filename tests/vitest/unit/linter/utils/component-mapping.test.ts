import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pluginPath = join(process.cwd(), 'dist/linter/eslint-plugin/index.js')
const eslintPlugin = require(pluginPath).default

const imageAlt = eslintPlugin.rules['image-alt']
const buttonLabel = eslintPlugin.rules['button-label']
const linkText = eslintPlugin.rules['link-text']

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

describe('Component Mapping', () => {
  describe('custom components via settings', () => {
    it('should treat custom Link component as anchor', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<Link href="/about">About Us</Link>',
            settings: {
              'a11y': {
                components: {
                  Link: 'a'
                }
              }
            }
          }
        ],
        invalid: [
          {
            code: '<Link href="/about">Click here</Link>',
            settings: {
              'a11y': {
                components: {
                  Link: 'a'
                }
              }
            },
            errors: [{ messageId: 'nonDescriptive' }]
          }
        ]
      })
    })

    it('should treat custom Button component as button', () => {
      ruleTester.run('button-label', buttonLabel, {
        valid: [
          {
            code: '<Button>Click me</Button>',
            settings: {
              'a11y': {
                components: {
                  Button: 'button'
                }
              }
            }
          },
          {
            code: '<Button aria-label="Close">×</Button>',
            settings: {
              'a11y': {
                components: {
                  Button: 'button'
                }
              }
            }
          }
        ],
        invalid: [
          {
            code: '<Button></Button>',
            settings: {
              'a11y': {
                components: {
                  Button: 'button'
                }
              }
            },
            errors: [{ messageId: 'missingLabel' }]
          }
        ]
      })
    })

    it('should treat custom Image component as img', () => {
      ruleTester.run('image-alt', imageAlt, {
        valid: [
          {
            code: '<Image src="test.jpg" alt="Test" />',
            settings: {
              'a11y': {
                components: {
                  Image: 'img'
                }
              }
            }
          }
        ],
        invalid: [
          {
            code: '<Image src="test.jpg" />',
            settings: {
              'a11y': {
                components: {
                  Image: 'img'
                }
              }
            },
            errors: [{ messageId: 'missingAlt' }]
          }
        ]
      })
    })
  })

  describe('polymorphic components', () => {
    it('should treat polymorphic Link as anchor when as="a"', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<Link as="a" href="/about">About Us</Link>',
            settings: {
              'a11y': {
                polymorphicPropNames: ['as']
              }
            }
          }
        ],
        invalid: [
          {
            code: '<Link as="a" href="/about">Click here</Link>',
            settings: {
              'a11y': {
                polymorphicPropNames: ['as']
              }
            },
            errors: [{ messageId: 'nonDescriptive' }]
          }
        ]
      })
    })

    it('should treat polymorphic Button as button when as="button"', () => {
      ruleTester.run('button-label', buttonLabel, {
        valid: [
          {
            code: '<Button as="button">Click me</Button>',
            settings: {
              'a11y': {
                polymorphicPropNames: ['as']
              }
            }
          }
        ],
        invalid: [
          {
            code: '<Button as="button"></Button>',
            settings: {
              'a11y': {
                polymorphicPropNames: ['as']
              }
            },
            errors: [{ messageId: 'missingLabel' }]
          }
        ]
      })
    })

    it('should not error on dynamic polymorphic props', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<Link as={component} href="/about">About Us</Link>',
            settings: {
              'a11y': {
                polymorphicPropNames: ['as']
              }
            }
          }
        ],
        invalid: []
      })
    })
  })

  describe('precedence', () => {
    it('should prioritize native tag over component mapping', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<a href="/about">About Us</a>',
            settings: {
              'a11y': {
                components: {
                  a: 'button' // Should be ignored, native tag wins
                }
              }
            }
          }
        ],
        invalid: []
      })
    })

    it('should prioritize polymorphic prop over component mapping', () => {
      ruleTester.run('link-text', linkText, {
        valid: [
          {
            code: '<Link as="a" href="/about">About Us</Link>',
            settings: {
              'a11y': {
                components: {
                  Link: 'button'
                },
                polymorphicPropNames: ['as']
              }
            }
          }
        ],
        invalid: []
      })
    })
  })
})
