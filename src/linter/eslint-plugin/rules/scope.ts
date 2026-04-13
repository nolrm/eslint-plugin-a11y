/**
 * ESLint rule: scope
 *
 * Validates the `scope` attribute:
 * 1. The scope attribute is only valid on <th> elements.
 * 2. When present on <th>, the value must be one of: col, row, colgroup, rowgroup.
 */

import type { Rule } from 'eslint'
import { getJSXAttribute, hasJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute, hasVueAttribute } from '../utils/vue-ast-utils'

const VALID_SCOPE_VALUES = new Set(['col', 'row', 'colgroup', 'rowgroup'])

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce valid use of the scope attribute on table header elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      invalidElement: 'The scope attribute is only valid on <th> elements, not <{{element}}>.',
      invalidValue: 'Invalid scope value "{{value}}". Must be one of: col, row, colgroup, rowgroup.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') return
        if (!hasJSXAttribute(jsxNode, 'scope')) return

        const tagName = jsxNode.name.name?.toLowerCase()

        // scope is only valid on <th>
        if (tagName !== 'th') {
          context.report({
            node,
            messageId: 'invalidElement',
            data: { element: tagName }
          })
          return
        }

        // Validate scope value
        const scopeAttr = getJSXAttribute(jsxNode, 'scope')
        if (!scopeAttr?.value) return

        let scopeValue: string | null = null
        if (scopeAttr.value.type === 'Literal' && typeof scopeAttr.value.value === 'string') {
          scopeValue = scopeAttr.value.value.toLowerCase()
        } else if (scopeAttr.value.type === 'JSXExpressionContainer') {
          const expr = scopeAttr.value.expression as any
          if (expr?.type === 'Literal' && typeof expr.value === 'string') {
            scopeValue = expr.value.toLowerCase()
          }
        }

        if (scopeValue !== null && !VALID_SCOPE_VALUES.has(scopeValue)) {
          context.report({
            node: scopeAttr as any,
            messageId: 'invalidValue',
            data: { value: scopeValue }
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        if (!hasVueAttribute(vueNode, 'scope')) return

        // scope is only valid on <th>
        if (tagName !== 'th') {
          context.report({
            node,
            messageId: 'invalidElement',
            data: { element: tagName }
          })
          return
        }

        // Validate scope value
        const scopeAttr = getVueAttribute(vueNode, 'scope')
        const scopeValue = scopeAttr?.value?.value?.toLowerCase()

        if (scopeValue !== undefined && scopeValue !== null && !VALID_SCOPE_VALUES.has(scopeValue)) {
          context.report({
            node: scopeAttr as any,
            messageId: 'invalidValue',
            data: { value: scopeValue }
          })
        }
      }
    }
  }
}

export default rule
