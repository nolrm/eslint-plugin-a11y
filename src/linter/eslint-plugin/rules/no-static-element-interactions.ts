/**
 * ESLint rule: no-static-element-interactions
 *
 * Disallows event handlers on static (non-interactive) elements.
 * Static elements like div, span should not have event handlers
 * because they lack semantic meaning and keyboard accessibility.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute } from '../utils/vue-ast-utils'
import { isJSXElementStatic, isVueElementStatic } from '../utils/focusable-utils'
import { hasJSXEventHandler, hasVueEventHandler } from '../utils/event-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow event handlers on static elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noStaticElementInteractions: 'Static elements ({{element}}) should not have event handlers. Use an interactive element like <button> or add an appropriate role and tabindex.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          handlers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Event handlers to check for'
          },
          allowExpressionValues: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Only check static elements
        if (!isJSXElementStatic(jsxNode, context)) {
          return
        }

        // Skip if element has a role (making it interactive)
        if (hasJSXAttribute(jsxNode, 'role')) {
          const roleAttr = getJSXAttribute(jsxNode, 'role')
          if (roleAttr?.value?.type === 'Literal' && roleAttr.value.value) {
            // Has explicit role, not a static element anymore
            return
          }
        }

        // Check for event handlers
        if (!hasJSXEventHandler(jsxNode)) {
          return
        }

        // Get tag name for error message
        const tagName = jsxNode.name?.name || 'element'

        context.report({
          node,
          messageId: 'noStaticElementInteractions',
          data: { element: tagName }
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        // Only check static elements
        if (!isVueElementStatic(vueNode)) {
          return
        }

        // Skip if element has a role
        if (hasVueAttribute(vueNode, 'role')) {
          const roleAttr = getVueAttribute(vueNode, 'role')
          if (roleAttr?.value?.value) {
            return
          }
        }

        // Check for event handlers
        if (!hasVueEventHandler(vueNode)) {
          return
        }

        const tagName = vueNode.name || 'element'

        context.report({
          node,
          messageId: 'noStaticElementInteractions',
          data: { element: tagName }
        })
      }
    }
  }
}

export default rule
