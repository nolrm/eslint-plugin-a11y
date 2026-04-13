/**
 * ESLint rule: no-noninteractive-tabindex
 *
 * Disallows tabindex on non-interactive elements.
 * Non-interactive elements should not be in the tab order unless they
 * have been given an interactive role.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute } from '../utils/vue-ast-utils'
import {
  isJSXElementNonInteractive,
  isVueElementNonInteractive,
  getJSXTabIndexValue,
  getVueTabIndexValue,
  getJSXRole,
  getVueRole,
  hasInteractiveRole
} from '../utils/focusable-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow tabindex on non-interactive elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noNonInteractiveTabindex: 'Non-interactive elements ({{element}}) should not have tabindex. Either remove the tabindex or add an interactive role.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          roles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Roles that are allowed to have tabindex'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags that are allowed to have tabindex'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = context.options[0] || {}
    const allowedTags = new Set(options.tags || [])

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Check if has tabindex
        if (!hasJSXAttribute(jsxNode, 'tabIndex') && !hasJSXAttribute(jsxNode, 'tabindex')) {
          return
        }

        // Get tabindex value - allow tabindex="-1" as it removes from tab order
        const tabIndexValue = getJSXTabIndexValue(jsxNode)
        if (tabIndexValue === null || tabIndexValue < 0) {
          return
        }

        // Skip if element has interactive role
        const role = getJSXRole(jsxNode)
        if (hasInteractiveRole(role)) {
          return
        }

        // Only check non-interactive elements
        if (!isJSXElementNonInteractive(jsxNode, context)) {
          return
        }

        // Check if tag is in allowed list
        const tagName = jsxNode.name?.name?.toLowerCase() || ''
        if (allowedTags.has(tagName)) {
          return
        }

        context.report({
          node,
          messageId: 'noNonInteractiveTabindex',
          data: { element: jsxNode.name?.name || 'element' },
          suggest: [{
            desc: 'Remove tabindex attribute',
            fix(fixer) {
              const tabIndexAttr = getJSXAttribute(jsxNode, 'tabIndex') || getJSXAttribute(jsxNode, 'tabindex')
              if (tabIndexAttr) {
                return fixer.remove(tabIndexAttr as any)
              }
              return null
            }
          }]
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        // Check if has tabindex
        if (!hasVueAttribute(vueNode, 'tabindex')) {
          return
        }

        // Get tabindex value - allow tabindex="-1"
        const tabIndexValue = getVueTabIndexValue(vueNode)
        if (tabIndexValue === null || tabIndexValue < 0) {
          return
        }

        // Skip if element has interactive role
        const role = getVueRole(vueNode)
        if (hasInteractiveRole(role)) {
          return
        }

        // Only check non-interactive elements
        if (!isVueElementNonInteractive(vueNode)) {
          return
        }

        // Check if tag is in allowed list
        const tagName = vueNode.name?.toLowerCase() || ''
        if (allowedTags.has(tagName)) {
          return
        }

        context.report({
          node,
          messageId: 'noNonInteractiveTabindex',
          data: { element: vueNode.name || 'element' },
          suggest: [{
            desc: 'Remove tabindex attribute',
            fix(fixer) {
              const tabIndexAttr = getVueAttribute(vueNode, 'tabindex')
              if (tabIndexAttr) {
                return fixer.remove(tabIndexAttr as any)
              }
              return null
            }
          }]
        })
      }
    }
  }
}

export default rule
