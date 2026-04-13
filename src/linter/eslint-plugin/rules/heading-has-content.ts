/**
 * ESLint rule: heading-has-content
 *
 * Requires that heading elements (h1-h6) have accessible content.
 * Empty headings are confusing for screen reader users.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute } from '../utils/vue-ast-utils'

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require heading elements to have accessible content',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      headingMustHaveContent: 'Headings must have text content or an accessible label (aria-label, aria-labelledby, or title).'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          components: {
            type: 'array',
            items: { type: 'string' },
            description: 'Custom components that render headings'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = context.options[0] || {}
    const customComponents = new Set((options.components || []).map((c: string) => c.toLowerCase()))

    function hasAccessibleLabel(node: any, isJSX: boolean): boolean {
      if (isJSX) {
        // Check for aria-label
        const ariaLabel = getJSXAttribute(node, 'aria-label')
        if (ariaLabel?.value) {
          if (ariaLabel.value.type === 'Literal' && ariaLabel.value.value) {
            return true
          }
          if (ariaLabel.value.type === 'JSXExpressionContainer') {
            return true // Dynamic label, assume it's valid
          }
        }

        // Check for aria-labelledby
        if (hasJSXAttribute(node, 'aria-labelledby')) {
          return true
        }

        // Check for title
        const title = getJSXAttribute(node, 'title')
        if (title?.value?.type === 'Literal' && title.value.value) {
          return true
        }
      } else {
        // Vue checks
        const ariaLabel = getVueAttribute(node, 'aria-label')
        if (ariaLabel?.value?.value) {
          return true
        }

        if (hasVueAttribute(node, 'aria-labelledby')) {
          return true
        }

        const title = getVueAttribute(node, 'title')
        if (title?.value?.value) {
          return true
        }
      }

      return false
    }

    function hasTextContent(node: any): boolean {
      // Check for JSX children
      if (node.children) {
        for (const child of node.children) {
          // Text content
          if (child.type === 'JSXText') {
            const text = child.value?.trim()
            if (text && text.length > 0) {
              return true
            }
          }
          // Expression (assume it contains content)
          if (child.type === 'JSXExpressionContainer') {
            // Skip empty expressions
            if (child.expression?.type !== 'JSXEmptyExpression') {
              return true
            }
          }
          // Nested elements (might contain content)
          if (child.type === 'JSXElement') {
            return true
          }
        }
      }
      return false
    }

    function hasVueTextContent(node: any): boolean {
      // Check for Vue children
      if (node.children) {
        for (const child of node.children) {
          // Text content
          if (child.type === 'VText') {
            const text = child.value?.trim()
            if (text && text.length > 0) {
              return true
            }
          }
          // Child elements
          if (child.type === 'VElement') {
            return true
          }
          // Expression
          if (child.type === 'VExpressionContainer') {
            return true
          }
        }
      }
      return false
    }

    return {
      JSXElement(node: Rule.Node) {
        const jsxNode = node as any
        const openingElement = jsxNode.openingElement

        if (!openingElement?.name || openingElement.name.type !== 'JSXIdentifier') {
          return
        }

        const tagName = openingElement.name.name.toLowerCase()

        // Check if it's a heading tag or custom component
        if (!HEADING_TAGS.includes(tagName) && !customComponents.has(tagName)) {
          return
        }

        // Check for accessible label
        if (hasAccessibleLabel(openingElement, true)) {
          return
        }

        // Check for text content
        if (hasTextContent(jsxNode)) {
          return
        }

        // Check for dangerouslySetInnerHTML
        if (hasJSXAttribute(openingElement, 'dangerouslySetInnerHTML')) {
          return
        }

        context.report({
          node: openingElement,
          messageId: 'headingMustHaveContent'
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        // Check if it's a heading tag or custom component
        if (!HEADING_TAGS.includes(tagName) && !customComponents.has(tagName)) {
          return
        }

        // Check for accessible label
        if (hasAccessibleLabel(vueNode, false)) {
          return
        }

        // Check for text content
        if (hasVueTextContent(vueNode)) {
          return
        }

        // Check for v-html
        if (hasVueAttribute(vueNode, 'v-html')) {
          return
        }

        context.report({
          node,
          messageId: 'headingMustHaveContent'
        })
      }
    }
  }
}

export default rule
