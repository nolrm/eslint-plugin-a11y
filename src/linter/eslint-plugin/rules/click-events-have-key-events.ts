/**
 * ESLint rule: click-events-have-key-events
 *
 * Requires that elements with onClick also have a keyboard event handler.
 * Users who cannot use a mouse need keyboard access to interactive elements.
 */

import type { Rule } from 'eslint'
import { hasJSXClickHandler, hasJSXKeyboardHandler } from '../utils/event-utils'
import { hasVueClickHandler, hasVueKeyboardHandler } from '../utils/event-utils'
import { isJSXElementInteractive, isVueElementInteractive } from '../utils/focusable-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require onClick elements to have keyboard event handlers',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingKeyboardHandler: 'Elements with click handlers must also have a keyboard event handler (onKeyDown, onKeyUp, or onKeyPress) for accessibility. Keyboard users cannot trigger click events.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Only check elements with click handlers
        if (!hasJSXClickHandler(jsxNode)) {
          return
        }

        // Skip if element already has keyboard handler
        if (hasJSXKeyboardHandler(jsxNode)) {
          return
        }

        // Skip natively interactive elements (they already handle keyboard events)
        if (isJSXElementInteractive(jsxNode, context)) {
          const tagName = getElementRoleFromJSX(jsxNode, context)
          // Native interactive elements like button, a[href], input, etc. handle keyboard natively
          if (tagName && ['button', 'a', 'input', 'select', 'textarea', 'summary'].includes(tagName)) {
            return
          }
        }

        context.report({
          node,
          messageId: 'missingKeyboardHandler'
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        // Only check elements with click handlers
        if (!hasVueClickHandler(vueNode)) {
          return
        }

        // Skip if element already has keyboard handler
        if (hasVueKeyboardHandler(vueNode)) {
          return
        }

        // Skip natively interactive elements
        const tagName = vueNode.name?.toLowerCase()
        if (tagName && ['button', 'a', 'input', 'select', 'textarea', 'summary'].includes(tagName)) {
          return
        }

        // Also skip if element is interactive due to role
        if (isVueElementInteractive(vueNode)) {
          return
        }

        context.report({
          node,
          messageId: 'missingKeyboardHandler'
        })
      }
    }
  }
}

export default rule
