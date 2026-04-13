/**
 * ESLint rule: no-interactive-element-to-noninteractive-role
 *
 * Prevents stripping interactive semantics by applying role="none" or
 * role="presentation" to interactive elements. These elements are
 * natively interactive and their semantics should not be removed.
 */

import type { Rule } from 'eslint'
import { getJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute } from '../utils/vue-ast-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

// Elements whose interactive semantics should not be stripped
const INTERACTIVE_ELEMENTS = new Set([
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'summary',
])

const NONINTERACTIVE_ROLES = new Set(['none', 'presentation'])

function getJSXRoleValue(node: any): string | null {
  const roleAttr = getJSXAttribute(node, 'role')
  if (!roleAttr) return null
  if (roleAttr.value?.type === 'Literal' && typeof roleAttr.value.value === 'string') {
    return roleAttr.value.value.toLowerCase()
  }
  if (roleAttr.value?.type === 'JSXExpressionContainer') {
    const expr = roleAttr.value.expression as any
    if (expr?.type === 'Literal' && typeof expr.value === 'string') {
      return expr.value.toLowerCase()
    }
  }
  return null
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow assigning role="none" or role="presentation" to interactive elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noInteractiveToNoninteractive: 'Interactive element <{{element}}> cannot have role="{{role}}". This removes its interactive semantics from assistive technologies while keeping it focusable, causing confusion for screen reader users.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Resolve tag via component mapping (handles Button→button, etc.)
        const tagName = getElementRoleFromJSX(node, context)
        if (!tagName || !INTERACTIVE_ELEMENTS.has(tagName)) return

        const role = getJSXRoleValue(jsxNode)
        if (!role || !NONINTERACTIVE_ROLES.has(role)) return

        // <a> is only interactive when it has a real href
        if (tagName === 'a') {
          const hrefAttr = getJSXAttribute(jsxNode, 'href')
          if (!hrefAttr) return
          if (hrefAttr.value?.type === 'Literal' && !hrefAttr.value.value) return
        }

        // <input type="hidden"> is not interactive
        if (tagName === 'input') {
          const typeAttr = getJSXAttribute(jsxNode, 'type')
          if (typeAttr?.value?.type === 'Literal' && typeAttr.value.value === 'hidden') return
        }

        context.report({
          node,
          messageId: 'noInteractiveToNoninteractive',
          data: { element: tagName, role }
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()
        if (!INTERACTIVE_ELEMENTS.has(tagName)) return

        const roleAttr = getVueAttribute(vueNode, 'role')
        const role = roleAttr?.value?.value?.toLowerCase()
        if (!role || !NONINTERACTIVE_ROLES.has(role)) return

        // <a> is only interactive when it has a real href
        if (tagName === 'a') {
          const hrefAttr = getVueAttribute(vueNode, 'href')
          if (!hrefAttr || !hrefAttr.value?.value) return
        }

        // <input type="hidden"> is not interactive
        if (tagName === 'input') {
          const typeAttr = getVueAttribute(vueNode, 'type')
          if (typeAttr?.value?.value === 'hidden') return
        }

        context.report({
          node,
          messageId: 'noInteractiveToNoninteractive',
          data: { element: tagName, role }
        })
      }
    }
  }
}

export default rule
