/**
 * ESLint rule: no-aria-hidden-on-focusable
 *
 * Disallows aria-hidden="true" on focusable elements.
 * When aria-hidden is applied to a focusable element, it becomes invisible
 * to screen readers while still being focusable, causing confusion.
 */

import type { Rule } from 'eslint'
import { getJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute } from '../utils/vue-ast-utils'
import { isJSXElementFocusable, isVueElementFocusable } from '../utils/focusable-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow aria-hidden="true" on focusable elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noAriaHiddenOnFocusable: 'aria-hidden="true" must not be used on focusable elements. This makes the element invisible to screen readers while still being focusable, causing confusion. Either remove aria-hidden or make the element non-focusable with tabindex="-1".'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    function isAriaHiddenTrue(attr: any): boolean {
      if (!attr) return false

      // Check literal value
      if (attr.value?.type === 'Literal') {
        const value = attr.value.value
        return value === true || value === 'true'
      }

      // Check JSX expression with literal
      if (attr.value?.type === 'JSXExpressionContainer') {
        const expression = attr.value.expression
        if (expression?.type === 'Literal') {
          return expression.value === true || expression.value === 'true'
        }
      }

      return false
    }

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        const ariaHiddenAttr = getJSXAttribute(jsxNode, 'aria-hidden')
        if (!ariaHiddenAttr || !isAriaHiddenTrue(ariaHiddenAttr)) {
          return
        }

        if (isJSXElementFocusable(jsxNode, context)) {
          context.report({
            node,
            messageId: 'noAriaHiddenOnFocusable',
            suggest: [
              {
                desc: 'Remove aria-hidden attribute',
                fix(fixer) {
                  return fixer.remove(ariaHiddenAttr as any)
                }
              },
              {
                desc: 'Add tabindex="-1" to make element non-focusable',
                fix(fixer) {
                  const lastAttribute = jsxNode.attributes && jsxNode.attributes.length > 0
                    ? jsxNode.attributes[jsxNode.attributes.length - 1]
                    : null

                  if (lastAttribute) {
                    return fixer.insertTextAfter(lastAttribute, ' tabIndex={-1}')
                  }
                  return null
                }
              }
            ]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        const ariaHiddenAttr = getVueAttribute(vueNode, 'aria-hidden')
        if (!ariaHiddenAttr) return

        const value = ariaHiddenAttr.value?.value
        if (value !== 'true') return

        if (isVueElementFocusable(vueNode)) {
          context.report({
            node,
            messageId: 'noAriaHiddenOnFocusable',
            suggest: [
              {
                desc: 'Remove aria-hidden attribute',
                fix(fixer) {
                  return fixer.remove(ariaHiddenAttr as any)
                }
              }
            ]
          })
        }
      }
    }
  }
}

export default rule
