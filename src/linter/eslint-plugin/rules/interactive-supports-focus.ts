/**
 * ESLint rule: interactive-supports-focus
 *
 * Requires that elements with interactive ARIA roles be focusable.
 * If an element has a role like "button" or "link", it must be keyboard
 * accessible (have tabindex).
 */

import type { Rule } from 'eslint'
// Unused imports removed to fix type errors
import {
  isJSXElementFocusable,
  isVueElementFocusable,
  hasInteractiveRole,
  getJSXRole,
  getVueRole
} from '../utils/focusable-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require interactive elements to be focusable',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      interactiveMustBeFocusable: 'Elements with interactive role="{{role}}" must be focusable. Add tabindex="0" to make this element keyboard accessible.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Get the role
        const role = getJSXRole(jsxNode)

        // Only check elements with interactive roles
        if (!hasInteractiveRole(role)) {
          return
        }

        // Skip natively interactive elements (already focusable)
        const tagName = getElementRoleFromJSX(jsxNode, context)
        if (tagName && ['button', 'a', 'input', 'select', 'textarea', 'summary'].includes(tagName)) {
          return
        }

        // Check if element is focusable
        if (isJSXElementFocusable(jsxNode, context)) {
          return
        }

        context.report({
          node,
          messageId: 'interactiveMustBeFocusable',
          data: { role: role || '' },
          suggest: [{
            desc: 'Add tabindex="0" to make element focusable',
            fix(fixer) {
              const lastAttribute = jsxNode.attributes && jsxNode.attributes.length > 0
                ? jsxNode.attributes[jsxNode.attributes.length - 1]
                : null

              if (lastAttribute) {
                return fixer.insertTextAfter(lastAttribute, ' tabIndex={0}')
              }
              return null
            }
          }]
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        // Get the role
        const role = getVueRole(vueNode)

        // Only check elements with interactive roles
        if (!hasInteractiveRole(role)) {
          return
        }

        // Skip natively interactive elements
        const tagName = vueNode.name?.toLowerCase()
        if (tagName && ['button', 'a', 'input', 'select', 'textarea', 'summary'].includes(tagName)) {
          return
        }

        // Check if element is focusable
        if (isVueElementFocusable(vueNode)) {
          return
        }

        context.report({
          node,
          messageId: 'interactiveMustBeFocusable',
          data: { role: role || '' },
          suggest: [{
            desc: 'Add tabindex="0" to make element focusable',
            fix(fixer) {
              const startTag = vueNode.startTag
              const lastAttribute = startTag?.attributes && startTag.attributes.length > 0
                ? startTag.attributes[startTag.attributes.length - 1]
                : null

              if (lastAttribute) {
                return fixer.insertTextAfter(lastAttribute, ' tabindex="0"')
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
