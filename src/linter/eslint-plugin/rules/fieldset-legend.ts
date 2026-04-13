/**
 * ESLint rule: fieldset-legend
 * 
 * Enforces that fieldset elements have an associated legend element
 */

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce fieldset elements have a legend element as a direct child',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingLegend: 'fieldset must have a legend element as a direct child',
      emptyLegend: 'fieldset legend must have non-empty text content'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX fieldset elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        if (jsxNode.name.name === 'fieldset') {
          // Check if fieldset has legend as a child
          const parent = (node as any).parent
          const hasLegend = parent?.children?.some((child: any) =>
            child.type === 'JSXElement' && child.openingElement?.name?.name === 'legend'
          )
          
          if (!hasLegend) {
            context.report({
              node,
              messageId: 'missingLegend'
            })
          }
        }
      },

      // Check Vue template fieldset elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        if (vueNode.name === 'fieldset') {
          const hasLegend = vueNode.children?.some((child: any) =>
            child.type === 'VElement' && child.name === 'legend'
          )
          
          if (!hasLegend) {
            context.report({
              node,
              messageId: 'missingLegend'
            })
          }
        }
      }
    }
  }
}

export default rule
