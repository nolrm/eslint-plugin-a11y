/**
 * ESLint rule: control-has-associated-label
 *
 * Ensures that interactive controls have an accessible label. Fills the gap
 * left by button-label and form-label: elements that receive interactive ARIA
 * roles (e.g. <div role="button">, <span role="checkbox">) must still have
 * an accessible name via aria-label, aria-labelledby, title, or text content.
 *
 * Native elements (button, input, select, textarea) are already covered by
 * button-label and form-label, so this rule focuses on ARIA-role controls.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute } from '../utils/vue-ast-utils'

// Interactive ARIA roles that require an accessible label
const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'checkbox', 'radio', 'textbox', 'combobox', 'listbox',
  'option', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'slider',
  'spinbutton', 'switch', 'tab', 'treeitem', 'gridcell', 'searchbox',
  'scrollbar',
])

// Native interactive elements already covered by button-label / form-label
const COVERED_NATIVELY = new Set(['button', 'input', 'select', 'textarea', 'a'])

function getJSXStaticRole(node: any): string | null {
  const roleAttr = getJSXAttribute(node, 'role')
  if (!roleAttr?.value) return null
  if (roleAttr.value.type === 'Literal' && typeof roleAttr.value.value === 'string') {
    return roleAttr.value.value.toLowerCase()
  }
  if (roleAttr.value.type === 'JSXExpressionContainer') {
    const expr = roleAttr.value.expression as any
    if (expr?.type === 'Literal' && typeof expr.value === 'string') {
      return expr.value.toLowerCase()
    }
  }
  return null
}

/**
 * Check if a JSX element has any text content in its children.
 * The opening element's parent is the JSXElement.
 */
function hasJSXTextContent(openingElement: any): boolean {
  const jsxElement = openingElement.parent
  if (!jsxElement?.children) return false
  return jsxElement.children.some((child: any) => {
    if (child.type === 'JSXText') return child.value.trim() !== ''
    // Expression containers might have dynamic text — treat as having content
    if (child.type === 'JSXExpressionContainer' && child.expression?.type !== 'JSXEmptyExpression') return true
    return false
  })
}

/**
 * Check if a Vue element has any text content in its children.
 */
function hasVueTextContent(vueNode: any): boolean {
  if (!vueNode.children) return false
  return vueNode.children.some((child: any) => {
    if (child.type === 'VText') return child.value.trim() !== ''
    // VExpressionContainer — dynamic content, treat as having text
    if (child.type === 'VExpressionContainer') return true
    return false
  })
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce interactive ARIA-role controls have an accessible label',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingLabel: 'Element with role="{{role}}" must have an accessible label. Add aria-label, aria-labelledby, title, or visible text content.'
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

        const tagName = jsxNode.name.name?.toLowerCase()
        // Native elements are covered by button-label / form-label
        if (COVERED_NATIVELY.has(tagName)) return

        const role = getJSXStaticRole(jsxNode)
        if (!role || !INTERACTIVE_ROLES.has(role)) return

        // Check for accessible label
        if (hasJSXAttribute(jsxNode, 'aria-label')) return
        if (hasJSXAttribute(jsxNode, 'aria-labelledby')) return
        if (hasJSXAttribute(jsxNode, 'title')) return
        if (hasJSXTextContent(jsxNode)) return

        context.report({
          node,
          messageId: 'missingLabel',
          data: { role }
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()
        if (COVERED_NATIVELY.has(tagName)) return

        const roleAttr = getVueAttribute(vueNode, 'role')
        const role = roleAttr?.value?.value?.toLowerCase()
        if (!role || !INTERACTIVE_ROLES.has(role)) return

        if (hasVueAttribute(vueNode, 'aria-label')) return
        if (hasVueAttribute(vueNode, 'aria-labelledby')) return
        if (hasVueAttribute(vueNode, 'title')) return
        if (hasVueTextContent(vueNode)) return

        context.report({
          node,
          messageId: 'missingLabel',
          data: { role }
        })
      }
    }
  }
}

export default rule
