/**
 * ESLint rule: aria-activedescendant-has-tabindex
 *
 * Requires that elements with aria-activedescendant have tabindex.
 * The aria-activedescendant attribute is used to manage focus within
 * composite widgets, but the container must be focusable.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute } from '../utils/vue-ast-utils'
import {
  isJSXElementFocusable,
  isVueElementFocusable,
  hasJSXTabIndex,
  hasVueTabIndex
} from '../utils/focusable-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require elements with aria-activedescendant to have tabindex',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingTabindex: 'Elements with aria-activedescendant must be focusable. Add tabindex="0" or tabindex="-1".'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Check if element has aria-activedescendant
        if (!hasJSXAttribute(jsxNode, 'aria-activedescendant')) {
          return
        }

        // Check if element is already focusable
        if (isJSXElementFocusable(jsxNode, context)) {
          return
        }

        // Check if element is natively focusable
        const tagName = getElementRoleFromJSX(jsxNode, context)
        if (tagName && ['input', 'select', 'textarea', 'button'].includes(tagName)) {
          return
        }

        // Check for tabindex (including -1)
        if (hasJSXTabIndex(jsxNode)) {
          return
        }

        context.report({
          node,
          messageId: 'missingTabindex',
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

        // Check if element has aria-activedescendant
        if (!hasVueAttribute(vueNode, 'aria-activedescendant')) {
          return
        }

        // Check if element is already focusable
        if (isVueElementFocusable(vueNode)) {
          return
        }

        // Check if element is natively focusable
        const tagName = vueNode.name?.toLowerCase()
        if (tagName && ['input', 'select', 'textarea', 'button'].includes(tagName)) {
          return
        }

        // Check for tabindex (including -1)
        if (hasVueTabIndex(vueNode)) {
          return
        }

        context.report({
          node,
          messageId: 'missingTabindex',
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
