/**
 * ESLint rule: autocomplete-valid
 *
 * Validates that the autocomplete attribute contains valid tokens.
 * The autocomplete attribute helps browsers auto-fill form fields,
 * improving both usability and accessibility.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute, isJSXAttributeDynamic } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute, isVueAttributeDynamic } from '../utils/vue-ast-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

// Valid autocomplete tokens per WHATWG spec
const VALID_AUTOCOMPLETE_TOKENS = new Set([
  'on',
  'off',
  // Contact information
  'name',
  'honorific-prefix',
  'given-name',
  'additional-name',
  'family-name',
  'honorific-suffix',
  'nickname',
  'email',
  'username',
  'new-password',
  'current-password',
  'one-time-code',
  'organization-title',
  'organization',
  'street-address',
  'address-line1',
  'address-line2',
  'address-line3',
  'address-level4',
  'address-level3',
  'address-level2',
  'address-level1',
  'country',
  'country-name',
  'postal-code',
  'cc-name',
  'cc-given-name',
  'cc-additional-name',
  'cc-family-name',
  'cc-number',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'cc-csc',
  'cc-type',
  'transaction-currency',
  'transaction-amount',
  'language',
  'bday',
  'bday-day',
  'bday-month',
  'bday-year',
  'sex',
  'tel',
  'tel-country-code',
  'tel-national',
  'tel-area-code',
  'tel-local',
  'tel-extension',
  'impp',
  'url',
  'photo',
  // Webauthn
  'webauthn',
])

// Optional section and addressing prefixes
const VALID_PREFIXES = new Set([
  'shipping',
  'billing',
  'home',
  'work',
  'mobile',
  'fax',
  'pager',
])

/**
 * Validate an autocomplete value
 */
function isValidAutocomplete(value: string): boolean {
  if (!value || typeof value !== 'string') return false

  const tokens = value.trim().toLowerCase().split(/\s+/)

  // Handle "on" and "off" - must be alone
  if (tokens.length === 1 && (tokens[0] === 'on' || tokens[0] === 'off')) {
    return true
  }

  // Skip "on" and "off" if more tokens follow (invalid)
  if (tokens[0] === 'on' || tokens[0] === 'off') {
    return tokens.length === 1
  }

  // Check for section- prefix
  let startIndex = 0
  if (tokens[0]?.startsWith('section-')) {
    startIndex = 1
  }

  // Check for optional shipping/billing prefix
  if (startIndex < tokens.length && VALID_PREFIXES.has(tokens[startIndex])) {
    startIndex++
  }

  // The remaining token should be a valid autocomplete token
  if (startIndex >= tokens.length) {
    return false
  }

  const mainToken = tokens[startIndex]
  if (!VALID_AUTOCOMPLETE_TOKENS.has(mainToken)) {
    return false
  }

  // Check for contact tokens that allow home/work/mobile/fax/pager prefix
  // These are already handled above, so just verify no extra tokens
  return startIndex === tokens.length - 1
}

// Elements that support autocomplete
const AUTOCOMPLETE_ELEMENTS = ['input', 'select', 'textarea']

// Input types that DON'T support autocomplete
const NON_AUTOCOMPLETE_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'file',
  'hidden',
  'image',
  'radio',
  'reset',
  'submit',
])

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate autocomplete attribute values',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      invalidAutocomplete: 'Invalid autocomplete value "{{value}}". Use a valid autocomplete token like "name", "email", "username", etc.',
      autocompleteNotSupported: 'The autocomplete attribute is not supported on <{{element}}{{type}}>.',
      dynamicAutocomplete: 'The autocomplete attribute is dynamic. Ensure it resolves to a valid autocomplete token at runtime.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    function getInputType(node: any, isJSX: boolean): string | null {
      if (isJSX) {
        const typeAttr = getJSXAttribute(node, 'type')
        if (typeAttr?.value?.type === 'Literal') {
          return String(typeAttr.value.value).toLowerCase()
        }
      } else {
        const typeAttr = getVueAttribute(node, 'type')
        if (typeAttr?.value?.value) {
          return typeAttr.value.value.toLowerCase()
        }
      }
      return 'text' // Default input type
    }

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        if (!hasJSXAttribute(jsxNode, 'autoComplete') && !hasJSXAttribute(jsxNode, 'autocomplete')) {
          return
        }

        const tagName = getElementRoleFromJSX(jsxNode, context)

        // Check if element supports autocomplete
        if (tagName && !AUTOCOMPLETE_ELEMENTS.includes(tagName)) {
          return // Don't report - autocomplete on non-form elements is just ignored
        }

        // Check if input type supports autocomplete
        if (tagName === 'input') {
          const inputType = getInputType(jsxNode, true)
          if (inputType && NON_AUTOCOMPLETE_INPUT_TYPES.has(inputType)) {
            context.report({
              node,
              messageId: 'autocompleteNotSupported',
              data: { element: 'input', type: ` type="${inputType}"` }
            })
            return
          }
        }

        const autocompleteAttr = getJSXAttribute(jsxNode, 'autoComplete') || getJSXAttribute(jsxNode, 'autocomplete')
        if (!autocompleteAttr) return

        // Check if dynamic
        if (isJSXAttributeDynamic(autocompleteAttr)) {
          context.report({
            node,
            messageId: 'dynamicAutocomplete'
          })
          return
        }

        // Get static value
        let value: string | null = null
        if (autocompleteAttr.value?.type === 'Literal') {
          value = String(autocompleteAttr.value.value)
        } else if (autocompleteAttr.value?.type === 'JSXExpressionContainer' &&
                   autocompleteAttr.value.expression?.type === 'Literal') {
          value = String((autocompleteAttr.value.expression as any).value)
        }

        if (value && !isValidAutocomplete(value)) {
          context.report({
            node,
            messageId: 'invalidAutocomplete',
            data: { value }
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        if (!hasVueAttribute(vueNode, 'autocomplete')) {
          return
        }

        const tagName = vueNode.name?.toLowerCase()

        // Check if element supports autocomplete
        if (tagName && !AUTOCOMPLETE_ELEMENTS.includes(tagName)) {
          return
        }

        // Check if input type supports autocomplete
        if (tagName === 'input') {
          const inputType = getInputType(vueNode, false)
          if (inputType && NON_AUTOCOMPLETE_INPUT_TYPES.has(inputType)) {
            context.report({
              node,
              messageId: 'autocompleteNotSupported',
              data: { element: 'input', type: ` type="${inputType}"` }
            })
            return
          }
        }

        const autocompleteAttr = getVueAttribute(vueNode, 'autocomplete')
        if (!autocompleteAttr) return

        // Check if dynamic
        if (isVueAttributeDynamic(autocompleteAttr)) {
          context.report({
            node,
            messageId: 'dynamicAutocomplete'
          })
          return
        }

        const value = autocompleteAttr.value?.value
        if (value && !isValidAutocomplete(value)) {
          context.report({
            node,
            messageId: 'invalidAutocomplete',
            data: { value }
          })
        }
      }
    }
  }
}

export default rule
