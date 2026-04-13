/**
 * ESLint rule: mouse-events-have-key-events
 *
 * Requires that elements with mouse event handlers (onMouseOver, onMouseOut)
 * also have corresponding keyboard event handlers (onFocus, onBlur).
 * This ensures keyboard users can access the same functionality.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute } from '../utils/jsx-ast-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require mouse event handlers to have keyboard event handlers',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      mouseOverWithoutFocus: 'onMouseOver must be accompanied by onFocus for keyboard accessibility.',
      mouseOutWithoutBlur: 'onMouseOut must be accompanied by onBlur for keyboard accessibility.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Check onMouseOver requires onFocus
        const hasMouseOver = hasJSXAttribute(jsxNode, 'onMouseOver') || hasJSXAttribute(jsxNode, 'onMouseOverCapture')
        const hasFocus = hasJSXAttribute(jsxNode, 'onFocus') || hasJSXAttribute(jsxNode, 'onFocusCapture')

        if (hasMouseOver && !hasFocus) {
          context.report({
            node,
            messageId: 'mouseOverWithoutFocus'
          })
        }

        // Check onMouseOut requires onBlur
        const hasMouseOut = hasJSXAttribute(jsxNode, 'onMouseOut') || hasJSXAttribute(jsxNode, 'onMouseOutCapture')
        const hasBlur = hasJSXAttribute(jsxNode, 'onBlur') || hasJSXAttribute(jsxNode, 'onBlurCapture')

        if (hasMouseOut && !hasBlur) {
          context.report({
            node,
            messageId: 'mouseOutWithoutBlur'
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const startTag = vueNode.startTag

        if (!startTag?.attributes) return

        // Check for mouse over handlers
        const hasMouseOver = startTag.attributes.some((attr: any) => {
          if (attr.directive && attr.key?.name?.name === 'on') {
            const argument = attr.key?.argument?.name
            return argument === 'mouseover'
          }
          return false
        })

        // Check for focus handler
        const hasFocus = startTag.attributes.some((attr: any) => {
          if (attr.directive && attr.key?.name?.name === 'on') {
            const argument = attr.key?.argument?.name
            return argument === 'focus'
          }
          return false
        })

        if (hasMouseOver && !hasFocus) {
          context.report({
            node,
            messageId: 'mouseOverWithoutFocus'
          })
        }

        // Check for mouse out handlers
        const hasMouseOut = startTag.attributes.some((attr: any) => {
          if (attr.directive && attr.key?.name?.name === 'on') {
            const argument = attr.key?.argument?.name
            return argument === 'mouseout'
          }
          return false
        })

        // Check for blur handler
        const hasBlur = startTag.attributes.some((attr: any) => {
          if (attr.directive && attr.key?.name?.name === 'on') {
            const argument = attr.key?.argument?.name
            return argument === 'blur'
          }
          return false
        })

        if (hasMouseOut && !hasBlur) {
          context.report({
            node,
            messageId: 'mouseOutWithoutBlur'
          })
        }
      }
    }
  }
}

export default rule
