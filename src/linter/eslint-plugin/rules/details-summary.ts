/**
 * ESLint rule: details-summary
 * 
 * Enforces that details elements have a summary element as first child
 */

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce details elements have a summary element as first child',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingSummary: 'details element must have a summary element as its first child',
      emptySummary: 'details summary element must have non-empty text content'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX details elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        if (jsxNode.name.name === 'details') {
          // Check if details has summary as first child
          const parent = (node as any).parent
          const firstChild = parent?.children?.[0]
          
          if (!firstChild || 
              firstChild.type !== 'JSXElement' || 
              firstChild.openingElement?.name?.name !== 'summary') {
            context.report({
              node,
              messageId: 'missingSummary'
            })
          }
        }
      },

      // Check Vue template elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        if (vueNode.name === 'details') {
          const firstChild = vueNode.children?.[0]
          
          if (!firstChild || 
              firstChild.type !== 'VElement' || 
              firstChild.name !== 'summary') {
            context.report({
              node,
              messageId: 'missingSummary'
            })
          }
        }
      }
    }
  }
}

export default rule
