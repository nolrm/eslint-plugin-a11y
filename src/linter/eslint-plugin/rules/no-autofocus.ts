/**
 * ESLint rule: no-autofocus
 *
 * Disallows the autofocus attribute on elements.
 * Autofocus can disorient users and reduce accessibility by unexpectedly
 * moving focus when the page loads.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute } from '../utils/vue-ast-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow autofocus attribute on elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noAutofocus: 'The autofocus attribute can disorient users and reduce accessibility. Remove this attribute.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          ignoreNonDOM: {
            type: 'boolean',
            default: false
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = context.options[0] || {}
    const ignoreNonDOM = options.ignoreNonDOM === true

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Skip if ignoreNonDOM is true and element is not a native DOM element
        if (ignoreNonDOM && jsxNode.name?.type === 'JSXIdentifier') {
          const name = jsxNode.name.name
          // Custom components start with uppercase
          if (name && name[0] === name[0].toUpperCase()) {
            return
          }
        }

        if (hasJSXAttribute(jsxNode, 'autoFocus') || hasJSXAttribute(jsxNode, 'autofocus')) {
          context.report({
            node,
            messageId: 'noAutofocus',
            suggest: [{
              desc: 'Remove autofocus attribute',
              fix(fixer) {
                const attr = jsxNode.attributes.find((a: any) =>
                  a.name?.name?.toLowerCase() === 'autofocus'
                )
                if (attr) {
                  return fixer.remove(attr)
                }
                return null
              }
            }]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        if (hasVueAttribute(vueNode, 'autofocus')) {
          context.report({
            node,
            messageId: 'noAutofocus',
            suggest: [{
              desc: 'Remove autofocus attribute',
              fix(fixer) {
                const attr = vueNode.startTag?.attributes?.find((a: any) =>
                  a.key?.name === 'autofocus' || a.key?.argument === 'autofocus'
                )
                if (attr) {
                  return fixer.remove(attr)
                }
                return null
              }
            }]
          })
        }
      }
    }
  }
}

export default rule
