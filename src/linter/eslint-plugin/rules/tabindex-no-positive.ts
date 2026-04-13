/**
 * ESLint rule: tabindex-no-positive
 *
 * Disallows positive tabindex values.
 * Positive tabindex values disrupt the natural tab order and make
 * keyboard navigation unpredictable for users.
 */

import type { Rule } from 'eslint'
import { getJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute } from '../utils/vue-ast-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow positive tabindex values',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noPositiveTabindex: 'Avoid positive tabindex values (found: {{value}}). Use tabindex="0" to make elements focusable in DOM order, or tabindex="-1" for programmatic focus only.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    function getTabIndexValue(attr: any): number | null {
      if (!attr) return null

      // Handle string literal
      if (attr.value?.type === 'Literal') {
        const value = attr.value.value
        if (typeof value === 'number') return value
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10)
          return isNaN(parsed) ? null : parsed
        }
      }

      // Handle JSX expression with literal
      if (attr.value?.type === 'JSXExpressionContainer') {
        const expression = attr.value.expression
        if (expression?.type === 'Literal' && typeof expression.value === 'number') {
          return expression.value
        }
      }

      return null
    }

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        const tabIndexAttr = getJSXAttribute(jsxNode, 'tabIndex') || getJSXAttribute(jsxNode, 'tabindex')
        const tabIndexValue = getTabIndexValue(tabIndexAttr)

        if (tabIndexValue !== null && tabIndexValue > 0) {
          context.report({
            node,
            messageId: 'noPositiveTabindex',
            data: { value: String(tabIndexValue) },
            suggest: [{
              desc: 'Change to tabindex="0" (focusable in DOM order)',
              fix(fixer) {
                if (tabIndexAttr?.value) {
                  if (tabIndexAttr.value.type === 'Literal') {
                    return fixer.replaceText(tabIndexAttr.value as any, '"0"')
                  }
                  if (tabIndexAttr.value.type === 'JSXExpressionContainer') {
                    return fixer.replaceText(tabIndexAttr.value as any, '{0}')
                  }
                }
                return null
              }
            }]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        const tabIndexAttr = getVueAttribute(vueNode, 'tabindex')
        if (!tabIndexAttr?.value?.value) return

        const parsed = parseInt(tabIndexAttr.value.value, 10)
        if (!isNaN(parsed) && parsed > 0) {
          context.report({
            node,
            messageId: 'noPositiveTabindex',
            data: { value: String(parsed) },
            suggest: [{
              desc: 'Change to tabindex="0" (focusable in DOM order)',
              fix(fixer) {
                if (tabIndexAttr.value) {
                  return fixer.replaceText(tabIndexAttr.value as any, '"0"')
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
