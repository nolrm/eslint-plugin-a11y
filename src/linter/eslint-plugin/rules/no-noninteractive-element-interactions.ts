/**
 * ESLint rule: no-noninteractive-element-interactions
 *
 * Disallows event handlers on non-interactive elements.
 * Non-interactive elements like headings, paragraphs, and images
 * should not have event handlers as they are not meant for user input.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute } from '../utils/vue-ast-utils'
import { isJSXElementNonInteractive, isVueElementNonInteractive } from '../utils/focusable-utils'
import { hasJSXEventHandler, hasVueEventHandler } from '../utils/event-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow event handlers on non-interactive elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noNonInteractiveElementInteractions: 'Non-interactive elements ({{element}}) should not have event handlers. Use an interactive element like <button> or add an appropriate role and tabindex.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          handlers: {
            type: 'array',
            items: { type: 'string' }
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

        // Only check non-interactive elements
        if (!isJSXElementNonInteractive(jsxNode, context)) {
          return
        }

        // Skip if element has a role (making it interactive)
        if (hasJSXAttribute(jsxNode, 'role')) {
          const roleAttr = getJSXAttribute(jsxNode, 'role')
          if (roleAttr?.value?.type === 'Literal' && roleAttr.value.value) {
            return
          }
        }

        // Check for event handlers
        if (!hasJSXEventHandler(jsxNode)) {
          return
        }

        const tagName = jsxNode.name?.name || 'element'

        context.report({
          node,
          messageId: 'noNonInteractiveElementInteractions',
          data: { element: tagName }
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        // Only check non-interactive elements
        if (!isVueElementNonInteractive(vueNode)) {
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
          messageId: 'noNonInteractiveElementInteractions',
          data: { element: tagName }
        })
      }
    }
  }
}

export default rule
