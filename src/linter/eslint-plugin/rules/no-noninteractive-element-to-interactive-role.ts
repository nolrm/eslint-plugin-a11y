/**
 * ESLint rule: no-noninteractive-element-to-interactive-role
 *
 * Prevents adding interactive ARIA roles to non-interactive HTML elements
 * without the proper keyboard support. For example, <div role="button"> requires
 * tabIndex and keyboard event handlers to be accessible.
 */

import type { Rule } from 'eslint'
import { getJSXAttribute, hasJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute, hasVueAttribute } from '../utils/vue-ast-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

// Non-interactive elements that should not receive interactive roles without
// keyboard support (tabindex + keyboard event handlers)
const NON_INTERACTIVE_ELEMENTS = new Set([
  'div', 'span', 'section', 'article', 'aside', 'footer', 'header', 'nav', 'main',
  'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'figure', 'figcaption', 'blockquote', 'pre', 'code', 'em', 'strong',
  'small', 'mark', 'sub', 'sup', 'address', 'time', 'abbr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'hr',
])

// Interactive ARIA roles that require keyboard accessibility when applied to
// non-interactive elements
const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'checkbox', 'radio', 'textbox', 'combobox', 'listbox',
  'option', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'slider',
  'spinbutton', 'switch', 'tab', 'treeitem', 'gridcell', 'searchbox',
  'scrollbar',
])

const JSX_KEYBOARD_HANDLERS = ['onKeyDown', 'onKeyUp', 'onKeyPress']

function hasJSXKeyboardHandler(node: any): boolean {
  return JSX_KEYBOARD_HANDLERS.some(handler => hasJSXAttribute(node, handler))
}

function hasVueKeyboardHandler(node: any): boolean {
  return (node.startTag?.attributes ?? []).some((attr: any) =>
    attr.directive &&
    attr.key?.name?.name === 'on' &&
    ['keydown', 'keyup', 'keypress'].includes(attr.key?.argument?.name)
  )
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow interactive ARIA roles on non-interactive elements without keyboard support',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noNoninteractiveToInteractive: 'Non-interactive element <{{element}}> should not have interactive role="{{role}}" without keyboard support. Add tabIndex and a keyboard event handler (onKeyDown/onKeyUp), or use a native interactive element like <button>.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Resolve tag via component mapping (handles Div→div, etc.)
        const tagName = getElementRoleFromJSX(node, context)
        if (!tagName || !NON_INTERACTIVE_ELEMENTS.has(tagName)) return

        const roleAttr = getJSXAttribute(jsxNode, 'role')
        if (!roleAttr) return

        let role: string | null = null
        if (roleAttr.value?.type === 'Literal' && typeof roleAttr.value.value === 'string') {
          role = roleAttr.value.value.toLowerCase()
        } else if (roleAttr.value?.type === 'JSXExpressionContainer') {
          const expr = roleAttr.value.expression as any
          if (expr?.type === 'Literal' && typeof expr.value === 'string') {
            role = expr.value.toLowerCase()
          }
        }

        if (!role || !INTERACTIVE_ROLES.has(role)) return

        // Check keyboard accessibility: needs both tabindex AND keyboard handler
        const hasTabIndex = hasJSXAttribute(jsxNode, 'tabIndex') || hasJSXAttribute(jsxNode, 'tabindex')
        const hasKeyboard = hasJSXKeyboardHandler(jsxNode)

        if (!hasTabIndex || !hasKeyboard) {
          context.report({
            node,
            messageId: 'noNoninteractiveToInteractive',
            data: { element: tagName, role }
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()
        if (!NON_INTERACTIVE_ELEMENTS.has(tagName)) return

        const roleAttr = getVueAttribute(vueNode, 'role')
        const role = roleAttr?.value?.value?.toLowerCase()
        if (!role || !INTERACTIVE_ROLES.has(role)) return

        const hasTabIndex = hasVueAttribute(vueNode, 'tabindex')
        const hasKeyboard = hasVueKeyboardHandler(vueNode)

        if (!hasTabIndex || !hasKeyboard) {
          context.report({
            node,
            messageId: 'noNoninteractiveToInteractive',
            data: { element: tagName, role }
          })
        }
      }
    }
  }
}

export default rule
